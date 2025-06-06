/**
  * vue-cal v4.8.1
  * (c) 2022 Antoni Andre <antoniandre.web@gmail.com>
  * @license MIT
  */
const a = ["\u062F\u0648\u0634\u0646\u0628\u0647", "\u0633\u0647 \u0634\u0646\u0628\u0647", "\u0686\u0647\u0627\u0631 \u0634\u0646\u0628\u0647", "\u067E\u0646\u062C \u0634\u0646\u0628\u0647", "\u062C\u0645\u0639\u0647", "\u0634\u0646\u0628\u0647", "\u06CC\u06A9 \u0634\u0646\u0628\u0647"], e = ["\u0698\u0627\u0646\u0648\u06CC\u0647", "\u0641\u0648\u0631\u06CC\u0647", "\u0645\u0627\u0631\u0633", "\u0622\u0648\u0631\u06CC\u0644", "\u0645\u06CC", "\u0698\u0648\u0626\u0646", "\u0698\u0648\u0626\u06CC\u0647", "\u0627\u0648\u062A", "\u0633\u067E\u062A\u0627\u0645\u0628\u0631", "\u0627\u06A9\u062A\u0628\u0631", "\u0646\u0648\u0627\u0645\u0628\u0631", "\u062F\u0633\u0627\u0645\u0628\u0631"], t = "\u0633\u0627\u0644\u0647\u0627", s = "\u0633\u0627\u0644", d = "\u0645\u0627\u0647", n = "\u0647\u0641\u062A\u0647", o = "\u0631\u0648\u0632", y = "\u0627\u0645\u0631\u0648\u0632", r = "\u0631\u0648\u06CC\u062F\u0627\u062F\u06CC \u0646\u06CC\u0633\u062A", M = "\u062A\u0645\u0627\u0645 \u0631\u0648\u0632", Y = "\u062D\u0630\u0641", l = "\u0627\u06CC\u062C\u0627\u062F \u06CC\u06A9 \u0631\u0648\u06CC\u062F\u0627\u062F", m = "dddd D MMMM YYYY", D = { weekDays: a, months: e, years: "\u0633\u0627\u0644\u0647\u0627", year: "\u0633\u0627\u0644", month: "\u0645\u0627\u0647", week: "\u0647\u0641\u062A\u0647", day: "\u0631\u0648\u0632", today: "\u0627\u0645\u0631\u0648\u0632", noEvent: "\u0631\u0648\u06CC\u062F\u0627\u062F\u06CC \u0646\u06CC\u0633\u062A", allDay: "\u062A\u0645\u0627\u0645 \u0631\u0648\u0632", deleteEvent: "\u062D\u0630\u0641", createEvent: "\u0627\u06CC\u062C\u0627\u062F \u06CC\u06A9 \u0631\u0648\u06CC\u062F\u0627\u062F", dateFormat: "dddd D MMMM YYYY" };
export {
  M as allDay,
  l as createEvent,
  m as dateFormat,
  o as day,
  D as default,
  Y as deleteEvent,
  d as month,
  e as months,
  r as noEvent,
  y as today,
  n as week,
  a as weekDays,
  s as year,
  t as years
};
