export const StorageUtils = {
  /**
   * Report localstorage usage in KB
   */
  getStorageUsage(): {
    totalUsed: number
    report: Record<string, number>
  } {
    let totalBytesUsed = 0
    let report: Record<string, number> = {}

    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const keySize = key.length * 2
        const valueSize = localStorage[key].length * 2
        totalBytesUsed += keySize + valueSize
        report[key] = (keySize + valueSize) / 1024
      }
    }
    return { totalUsed: totalBytesUsed / 1024, report }
  },
}
