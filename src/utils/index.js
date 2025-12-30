/**
 * 调用 jsx 方法
 * @param {string} jsxName - jsx 文件名
 * @param {string} fnName - 函数名
 * @param {string} callback - 回调函数
 */
export const evalScript = (jsxName, fnName, callback) => {
  const csInterface = new CSInterface();
  const jsxPath = `${csInterface.getSystemPath(SystemPath.EXTENSION)}/jsx/${jsxName}.jsx`
  const script = '$.evalFile("' + jsxPath + '");' + `${fnName}();`
  csInterface.evalScript(script, callback)
}