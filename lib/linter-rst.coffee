linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"

{log, warn} = require "#{linterPath}/lib/utils"


class LinterRst extends Linter
  @syntax: 'text.restructuredtext'
  @cfg: null
  @cmd: ''
  linterName: 'rst'
  errorStream: 'stderr'
  regex: ':(?<line>\\d+):\\s+[(]((?<error>ERROR)|(?<warning>WARNING))(/\\d+)[)]\\s+(?<message>.+)\n'

  constructor: (@editor) ->
    super @editor
    @cfg = atom.config.get('linter-rst')
    @cmd = @cfg['executablePath']


module.exports = LinterRst

