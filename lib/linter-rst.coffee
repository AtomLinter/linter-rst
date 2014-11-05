linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"


class LinterRst extends Linter
  @syntax: 'text.restructuredtext'
  linterName: 'rst'
  errorStream: 'stderr'
  regex: ':(?<line>\\d+):\\s+[(]((?<error>ERROR)|(?<warning>WARNING))(/\\d+)[)]\\s+(?<message>.+)\n'

  constructor: (@editor) ->
    super @editor
    atom.config.observe 'linter-rst.executablePath', =>
      @executablePath = atom.config.get 'linter-rst.executablePath'

  destroy: ->
     atom.config.unobserve 'linter-rst.executablePath'


module.exports = LinterRst

