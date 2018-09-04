export const numberFormat = number => {
  if (number === 0) return "0";
  let nFormat = number;
  let str = "";
  const ti = 1000000000;
  const trieu = 1000000;
  const nghin = 1000;
  if (nFormat / ti >= 1) {
    str += `${parseInt(nFormat / ti, 10)}.`;
    nFormat %= ti;
  }
  if (nFormat > trieu && nFormat / trieu >= 1) {
    str += `${parseInt(nFormat / trieu, 10)}.`;
    nFormat %= trieu;
  }
  if (nFormat > nghin && nFormat / nghin >= 1) {
    str += `${parseInt(nFormat / nghin, 10)}.`;
    nFormat %= nghin;
  }
  if (nFormat > 100) {
    str += `${nFormat}`;
  } else if (nFormat > 10) {
    str += str !== "" ? `0${nFormat}` : nFormat;
  } else if (nFormat > 0) {
    str += str !== "" ? `0${nFormat}` : nFormat;
  }
  return str;
};

export const moneyFormat = (number, dot = "đ") => {
  const temNumber = number && !isNaN(Number(number)) ? number : 0;
  const arrStr = [];
  let temp = `${temNumber}`;
  while (temp) {
    const strStr = temp.substring(
      temp.length - 3 < 0 ? 0 : temp.length - 3,
      temp.length
    );
    temp = temp.substring(0, temp.length - 3 < 0 ? 0 : temp.length - 3);
    arrStr.unshift(strStr);
  }
  return `${arrStr.join(".")} ${dot}`;
  // if (number === 0) return `0${dot}`;
  // let nFormat = number;
  // let str = "";
  // const ti = 1000000000;
  // const trieu = 1000000;
  // const nghin = 1000;
  // if (nFormat / ti >= 1) {
  //   str += `${parseInt(nFormat / ti, 10)}.`;
  //   nFormat %= ti;
  // }
  // if (nFormat > trieu && nFormat / trieu >= 1) {
  //   str += `${parseInt(nFormat / trieu, 10)}.`;
  //   nFormat %= trieu;
  // }
  // if (nFormat > nghin && nFormat / nghin >= 1) {
  //   str += `${parseInt(nFormat / nghin, 10)}.`;
  //   nFormat %= nghin;
  // }
  // if (nFormat > 100) {
  //   str += `${nFormat}`;
  // } else if (nFormat > 10) {
  //   str += `0${nFormat}`;
  // } else {
  //   str += `00${nFormat}`;
  // }
  // return str + dot;
};
