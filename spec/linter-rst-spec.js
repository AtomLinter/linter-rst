'use babel';

import * as path from 'path';
import {
  // eslint-disable-next-line no-unused-vars
  it, fit, wait, beforeEach, afterEach,
} from 'jasmine-fix';

const { lint } = require('../lib/linter-rst.js').provideLinter();

const badFile = path.join(__dirname, 'fixtures', 'bad.rst');
const warnFile = path.join(__dirname, 'fixtures', 'warn.rst');
const goodFile = path.join(__dirname, 'fixtures', 'good.rst');

describe('The restructuredtext provider for Linter', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('language-restructuredtext');
    await atom.packages.activatePackage('linter-rst');
  });

  it('checks a file with syntax error and reports the correct message', async () => {
    const excerpt = 'Title overline & underline mismatch.';
    const editor = await atom.workspace.open(badFile);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].severity).toBe('error');
    expect(messages[0].excerpt).toBe(excerpt);
    expect(messages[0].location.file).toBe(badFile);
    expect(messages[0].location.position).toEqual([[0, 0], [0, 40]]);
  });

  it('checks a file with a deprecation warning and reports the correct message', async () => {
    const excerpt = 'Title underline too short.';
    const editor = await atom.workspace.open(warnFile);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].severity).toBe('warning');
    expect(messages[0].excerpt).toBe(excerpt);
    expect(messages[0].location.file).toBe(warnFile);
    expect(messages[0].location.position).toEqual([[9, 0], [9, 24]]);
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(goodFile);
    const messages = await lint(editor);
    expect(messages.length).toBe(0);
  });
});
