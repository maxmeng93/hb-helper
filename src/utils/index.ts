/**
 * 比较插件的两个版本v1,v2大小
 * .e.g '3.1.7-alpha.19'
 * @param v1 { string } {major}.{minor}.{patch}-{pre-release}
 * @param v2 { string } {major}.{minor}.{patch}-{pre-release}
 * @return {number} 1大 0相等 -1小
 */
export const compareVersionLatest = (v1: string, v2: string): number => {
  const [v1Main, v1PreRelease] = v1.split("-");
  const [v2Main, v2PreRelease] = v2.split("-");

  // 比较版本主体的大小
  const v1List = v1Main.split(".");
  const v2List = v2Main.split(".");
  const len1 = v1List.length;
  const len2 = v2List.length;
  const minLen = Math.min(len1, len2);
  let curIdx = 0;
  for (curIdx; curIdx < minLen; curIdx += 1) {
    const v1CurNum = parseInt(v1List[curIdx]);
    const v2CurNum = parseInt(v2List[curIdx]);
    if (v1CurNum > v2CurNum) {
      return 1;
    } else if (v1CurNum < v2CurNum) {
      return -1;
    }
  }
  if (len1 > len2) {
    for (let lastIdx = curIdx; lastIdx < len1; lastIdx++) {
      if (parseInt(v1List[lastIdx]) != 0) {
        return 1;
      }
    }
    return 0;
  } else if (len1 < len2) {
    for (let lastIdx = curIdx; lastIdx < len2; lastIdx += 1) {
      if (parseInt(v2List[lastIdx]) != 0) {
        return -1;
      }
    }
    return 0;
  }

  // 如果存在先行版本，还需要比较先行版本的大小
  if (v1PreRelease && !v2PreRelease) {
    return 1;
  } else if (!v1PreRelease && v2PreRelease) {
    return -1;
  } else if (v1PreRelease && v2PreRelease) {
    const [gama1, time1] = v1PreRelease.split(".");
    const [gama2, time2] = v2PreRelease.split(".");
    if (gama1 > gama2) return 1;
    if (gama2 > gama1) return -1;
    if (parseInt(time1) > parseInt(time2)) return 1;
    if (parseInt(time2) > parseInt(time1)) return -1;
  }
  return 0;
};
