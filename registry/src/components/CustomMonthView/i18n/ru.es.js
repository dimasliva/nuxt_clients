/**
  * vue-cal v4.8.1
  * (c) 2022 Antoni Andre <antoniandre.web@gmail.com>
  * @license MIT
  */
const a = ["\u041F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A", "\u0412\u0442\u043E\u0440\u043D\u0438\u043A", "\u0421\u0440\u0435\u0434\u0430", "\u0427\u0435\u0442\u0432\u0435\u0440\u0433", "\u041F\u044F\u0442\u043D\u0438\u0446\u0430", "\u0421\u0443\u0431\u0431\u043E\u0442\u0430", "\u0412\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435"], e = ["\u041F\u043D", "\u0412\u0442", "\u0421\u0440", "\u0427\u0442", "\u041F\u0442", "\u0421\u0431", "\u0412\u0441"], t = ["\u042F\u043D\u0432\u0430\u0440\u044C", "\u0424\u0435\u0432\u0440\u0430\u043B\u044C", "\u041C\u0430\u0440\u0442", "\u0410\u043F\u0440\u0435\u043B\u044C", "\u041C\u0430\u0439", "\u0418\u044E\u043D\u044C", "\u0418\u044E\u043B\u044C", "\u0410\u0432\u0433\u0443\u0441\u0442", "\u0421\u0435\u043D\u0442\u044F\u0431\u0440\u044C", "\u041E\u043A\u0442\u044F\u0431\u0440\u044C", "\u041D\u043E\u044F\u0431\u0440\u044C", "\u0414\u0435\u043A\u0430\u0431\u0440\u044C"], s = "\u0413\u043E\u0434\u044B", d = "\u0413\u043E\u0434", o = "\u041C\u0435\u0441\u044F\u0446", y = "\u041D\u0435\u0434\u0435\u043B\u044F", n = "\u0414\u0435\u043D\u044C", r = "\u0421\u0435\u0433\u043E\u0434\u043D\u044F", D = "\u041D\u0435\u0442 \u0441\u043E\u0431\u044B\u0442\u0438\u0439", M = "\u0412\u0435\u0441\u044C \u0434\u0435\u043D\u044C", Y = "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", l = "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u043E\u0431\u044B\u0442\u0438\u0435", h = "dddd D MMMM YYYY", k = { weekDays: a, weekDaysShort: e, months: t, years: "\u0413\u043E\u0434\u044B", year: "\u0413\u043E\u0434", month: "\u041C\u0435\u0441\u044F\u0446", week: "\u041D\u0435\u0434\u0435\u043B\u044F", day: "\u0414\u0435\u043D\u044C", today: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F", noEvent: "\u041D\u0435\u0442 \u0441\u043E\u0431\u044B\u0442\u0438\u0439", allDay: "\u0412\u0435\u0441\u044C \u0434\u0435\u043D\u044C", deleteEvent: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", createEvent: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u043E\u0431\u044B\u0442\u0438\u0435", dateFormat: "dddd D MMMM YYYY" };
export {
  M as allDay,
  l as createEvent,
  h as dateFormat,
  n as day,
  k as default,
  Y as deleteEvent,
  o as month,
  t as months,
  D as noEvent,
  r as today,
  y as week,
  a as weekDays,
  e as weekDaysShort,
  d as year,
  s as years
};
