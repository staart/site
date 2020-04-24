import { DateTime } from "luxon";
import CleanCSS from "clean-css";
const HRNumbers = require("human-readable-numbers");

export default {
  dateToFormat: function(date: Date, format: string) {
    return DateTime.fromJSDate(date, { zone: "Asia/Kolkata" }).toFormat(
      String(format)
    );
  },

  dateToISO: function(date: Date) {
    return DateTime.fromJSDate(date, { zone: "Asia/Kolkata" }).toISO({
      includeOffset: false,
      suppressMilliseconds: true,
    });
  },

  cssmin: function(css: string) {
    return new CleanCSS({ level: 2 }).minify(css).styles;
  },

  numberToLocale: function(num: string) {
    return parseInt(num, 10).toLocaleString();
  },
  numberToFloat: function(num: string) {
    return parseFloat(num).toLocaleString();
  },
  numberToReadable: (num: string | number) => HRNumbers.toHumanString(num),
};
