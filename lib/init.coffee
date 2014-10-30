module.exports =
  config:
    executablePath:
      type: 'string'
      default: 'rst2html.py'
      description: 'Path to rst2html.py.'

  activate: ->
    console.log 'Linter-Rst: package loaded,
                 ready to get initialized by AtomLinter.'
