'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

let helpers;

const REGEX = /:(\d+):\s+[(](ERROR|WARNING|SEVERE)\/(\d+)[)]\s+(.+)\n/g;

const severityMapping = {
  warning: 'warning',
  error: 'error',
  severe: 'error',
};

const loadDeps = () => {
  if (!helpers) {
    helpers = require('atom-linter');
  }
};

const parseRstOutput = (output, file, editor) => {
  const messages = [];
  let match = REGEX.exec(output);
  while (match !== null) {
    const line = Number.parseInt(match[1], 10) - 1;
    messages.push({
      severity: severityMapping[match[2].toLowerCase()] || 'warning',
      excerpt: match[4],
      location: {
        file,
        position: helpers.generateRange(editor, line),
      },
    });
    match = REGEX.exec(output);
  }
  return messages;
};

module.exports = {
  activate() {
    this.idleCallbacks = new Set();
    let depsCallbackID;
    const installLinterRstDeps = () => {
      this.idleCallbacks.delete(depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-rst');
      }
      loadDeps();
    };
    depsCallbackID = window.requestIdleCallback(installLinterRstDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.config.observe(
        'linter-rst.executablePath',
        (value) => { this.executablePath = value; },
      ),
    );
  },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'rst',
      grammarScopes: ['text.restructuredtext'],
      scope: 'file',
      lintsOnChange: false,
      lint: async (editor) => {
        if (!atom.workspace.isTextEditor(editor)) {
          // If we somehow get fed an invalid TextEditor just immediately return
          return null;
        }

        const filePath = editor.getPath();
        if (!filePath) {
          return null;
        }

        loadDeps();

        const args = [];
        args.push(filePath);

        const execOptions = {
          stream: 'stderr',
          uniqueKey: `linter-rst::${filePath}`,
          allowEmptyStderr: true,
        };

        let output;
        try {
          output = await helpers.exec(this.executablePath, args, execOptions);
        } catch (e) {
          if (e.message === 'Process execution timed out') {
            atom.notifications.addInfo('linter-rst: `rst2html.py` timed out', {
              description: 'A timeout occured while executing `rst2html.py`, it could be due to lower resources '
                           + 'or a temporary overload.',
            });
          } else {
            atom.notifications.addError('linter-rst: Unexpected error', { description: e.message });
          }
          return null;
        }

        // Process was canceled by newer process
        if (output === null) { return null; }

        return parseRstOutput(output, filePath, editor);
      },
    };
  },
};
