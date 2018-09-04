import Moment from "moment";
import vi from "moment/locale/vi";

export const formatDateNow = time => {
  if (Moment(time).format("Y") === Moment().format("Y")) {
    if (Moment(time).format("MMDD") === Moment().format("MMDD")) {
      return Moment(time)
        .second(1)
        .locale("vi")
        .fromNow();
    }
    return Moment(time).format("DD [tháng] MM");
  }
  return Moment(time).format("[ngày] DD [tháng] MM, Y");
};

export const formatDate = (time, language) => {
  if (Moment(time).format("Y") === Moment().format("Y")) {
    if (Moment(time).format("MMDD") === Moment().format("MMDD")) {
      return Moment(time).format("LT");
    } else {
      return language === "vi"
        ? Moment(time).format("DD [thg] MM")
        : Moment(time).format("DD/MM");
    }
  } else {
    return Moment(time).format("DD/MM/Y");
  }
};

export const formatDateTime = (time, language, multipleLines = false) => {
  if (!time) return false;
  if (Moment(time).format("Y") === Moment().format("Y")) {
    if (Moment(time).format("MMDD") === Moment().format("MMDD")) {
      return Moment(time).format("LT");
    } else {
      return language === "vi"
        ? Moment(time).format("H:mm, DD [thg] MM")
        : Moment(time).format("DD/MM H:mm");
    }
  } else {
    if (multipleLines) {
      return language === "vi"
        ? `${Moment(time).format("H:mm")} \n ${Moment(time).format(
            "DD [thg] MM, Y"
          )}`
        : `${Moment(time).format("H:mm")} \n ${Moment(time).format("DD/MM/Y")}`;
    } else {
      return language === "vi"
        ? Moment(time).format("H:mm, DD [thg] MM Y")
        : Moment(time).format("DD/MM/Y H:mm");
    }
  }
};

// Not for all cases
export const formatDateTime2 = time => {
  if (!time) return false;
  if (Moment(time).format("Y") === Moment().format("Y")) {
    return Moment(time).format("HH:mm, DD [thg] MM");
  } else {
    return Moment(time).format("HH:mm, DD/MM/Y");
  }
};

export const formatDate2 = time => {
  if (!time) return false;
  if (Moment(time).format("Y") === Moment().format("Y")) {
    return Moment(time).format("DD [thg] MM");
  } else {
    return Moment(time).format("DD/MM/Y");
  }
};
