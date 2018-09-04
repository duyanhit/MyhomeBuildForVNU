import settings, { env } from "core/config/settings";

/**
 * custom console log
 * chi show log khi trang thai la DEBUG (=true)
 *
 * @memberof AppComponent
 */
export const consoleLog = (str1, ...str2) => {
  if (settings.environment === env.DEV) {
    console.log(" --------- --------------- -------------- ----------");
    console.log(str1, ...str2);
    console.log("----------------------------------------------------");
  }
};
