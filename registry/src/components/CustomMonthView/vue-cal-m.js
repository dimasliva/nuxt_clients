var ae = Object.defineProperty;
var le = (e, t, i) => t in e ? ae(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i;
var W = (e, t, i) => (le(e, typeof t != "symbol" ? t + "" : t, i), i);
import { openBlock as h, createElementBlock as c, Fragment as T, renderList as S, normalizeClass as b, normalizeStyle as $, createVNode as P, Transition as U, withCtx as g, createElementVNode as k, renderSlot as w, toDisplayString as f, createCommentVNode as v, createTextVNode as M, resolveComponent as j, createBlock as H, resolveDynamicComponent as oe, createSlots as q, withKeys as X, withModifiers as L, TransitionGroup as re, normalizeProps as G, mergeProps as Z } from "vue";
/**
  * vue-cal v4.8.1
  * (c) 2022 Antoni Andre <antoniandre.web@gmail.com>
  * @license MIT
  */
let N, J, Q, O, I = {}, F = {};
class de {
  constructor(t) {
    W(this, "_vuecal", null);
    W(this, "selectCell", (t = !1, i, n) => {
      this._vuecal.$emit("cell-click", n ? { date: i, split: n } : i), this._vuecal.clickToNavigate || t ? this._vuecal.switchToNarrowerView() : this._vuecal.dblclickToNavigate && "ontouchstart" in window && (this._vuecal.domEvents.dblTapACell.taps++, setTimeout(() => this._vuecal.domEvents.dblTapACell.taps = 0, this._vuecal.domEvents.dblTapACell.timeout), this._vuecal.domEvents.dblTapACell.taps >= 2 && (this._vuecal.domEvents.dblTapACell.taps = 0, this._vuecal.switchToNarrowerView(), this._vuecal.$emit("cell-dblclick", n ? { date: i, split: n } : i)));
    });
    W(this, "keyPressEnterCell", (t, i) => {
      this._vuecal.$emit("cell-keypress-enter", i ? { date: t, split: i } : t), this._vuecal.switchToNarrowerView();
    });
    W(this, "getPosition", (t) => {
      const { left: i, top: n } = this._vuecal.cellsEl.getBoundingClientRect(), { clientX: l, clientY: s } = "ontouchstart" in window && t.touches ? t.touches[0] : t;
      return { x: l - i, y: s - n };
    });
    W(this, "minutesAtCursor", (t) => {
      let i = 0, n = { x: 0, y: 0 };
      const { timeStep: l, timeCellHeight: s, timeFrom: o } = this._vuecal.$props;
      return typeof t == "number" ? i = t : typeof t == "object" && (n = this.getPosition(t), i = Math.round(n.y * l / parseInt(s) + o)), { minutes: Math.max(Math.min(i, 1440), 0), cursorCoords: n };
    });
    this._vuecal = t;
  }
}
let y, D, R;
class ue {
  constructor(t, i) {
    W(this, "_vuecal", null);
    W(this, "eventDefaults", { _eid: null, start: "", startTimeMinutes: 0, end: "", endTimeMinutes: 0, title: "", content: "", background: !1, allDay: !1, segments: null, repeat: null, daysCount: 1, deletable: !0, deleting: !1, titleEditable: !0, resizable: !0, resizing: !1, draggable: !0, dragging: !1, draggingStatic: !1, focused: !1, class: "" });
    this._vuecal = t, y = i;
  }
  createAnEvent(t, i, n) {
    if (typeof t == "string" && (t = y.stringToDate(t)), !(t instanceof Date))
      return !1;
    const l = y.dateToMinutes(t), s = l + (i = 1 * i || 120), o = y.addMinutes(new Date(t), i);
    n.end && (typeof n.end == "string" && (n.end = y.stringToDate(n.end)), n.endTimeMinutes = y.dateToMinutes(n.end));
    const a = { ...this.eventDefaults, _eid: `${this._vuecal._.uid}_${this._vuecal.eventIdIncrement++}`, start: t, startTimeMinutes: l, end: o, endTimeMinutes: s, segments: null, ...n };
    return typeof this._vuecal.onEventCreate != "function" || this._vuecal.onEventCreate(a, () => this.deleteAnEvent(a)) ? (a.startDateF !== a.endDateF && (a.daysCount = y.countDays(a.start, a.end)), this._vuecal.mutableEvents.push(a), this._vuecal.addEventsToView([a]), this._vuecal.emitWithEvent("event-create", a), this._vuecal.$emit("event-change", { event: this._vuecal.cleanupEvent(a), originalEvent: null }), a) : void 0;
  }
  addEventSegment(t) {
    t.segments || (t.segments = {}, t.segments[y.formatDateLite(t.start)] = { start: t.start, startTimeMinutes: t.startTimeMinutes, endTimeMinutes: 1440, isFirstDay: !0, isLastDay: !1 });
    const i = t.segments[y.formatDateLite(t.end)];
    i && (i.isLastDay = !1, i.endTimeMinutes = 1440);
    const n = y.addDays(t.end, 1), l = y.formatDateLite(n);
    return n.setHours(0, 0, 0, 0), t.segments[l] = { start: n, startTimeMinutes: 0, endTimeMinutes: t.endTimeMinutes, isFirstDay: !1, isLastDay: !0 }, t.end = y.addMinutes(n, t.endTimeMinutes), t.daysCount = Object.keys(t.segments).length, l;
  }
  removeEventSegment(t) {
    let i = Object.keys(t.segments).length;
    if (i <= 1)
      return y.formatDateLite(t.end);
    delete t.segments[y.formatDateLite(t.end)], i--;
    const n = y.subtractDays(t.end, 1), l = y.formatDateLite(n), s = t.segments[l];
    return i ? s && (s.isLastDay = !0, s.endTimeMinutes = t.endTimeMinutes) : t.segments = null, t.daysCount = i || 1, t.end = n, l;
  }
  createEventSegments(t, i, n) {
    const l = i.getTime(), s = n.getTime();
    let o, a, d, r = t.start.getTime(), u = t.end.getTime(), m = !1;
    for (t.end.getHours() || t.end.getMinutes() || (u -= 1e3), t.segments = {}, t.repeat ? (o = l, a = Math.min(s, t.repeat.until ? y.stringToDate(t.repeat.until).getTime() : s)) : (o = Math.max(l, r), a = Math.min(s, u)); o <= a; ) {
      let p = !1;
      const E = y.addDays(new Date(o), 1).setHours(0, 0, 0, 0);
      let _, x, V, C;
      if (t.repeat) {
        const Y = new Date(o), A = y.formatDateLite(Y);
        (m || t.occurrences && t.occurrences[A]) && (m || (r = t.occurrences[A].start, d = new Date(r).setHours(0, 0, 0, 0), u = t.occurrences[A].end), m = !0, p = !0), _ = o === d, x = A === y.formatDateLite(new Date(u)), V = new Date(_ ? r : o), C = y.formatDateLite(V), x && (m = !1);
      } else
        p = !0, _ = o === r, x = a === u && E > a, V = _ ? t.start : new Date(o), C = y.formatDateLite(_ ? t.start : V);
      p && (t.segments[C] = { start: V, startTimeMinutes: _ ? t.startTimeMinutes : 0, endTimeMinutes: x ? t.endTimeMinutes : 1440, isFirstDay: _, isLastDay: x }), o = E;
    }
    return t;
  }
  deleteAnEvent(t) {
    this._vuecal.emitWithEvent("event-delete", t), this._vuecal.mutableEvents = this._vuecal.mutableEvents.filter((i) => i._eid !== t._eid), this._vuecal.view.events = this._vuecal.view.events.filter((i) => i._eid !== t._eid);
  }
  checkCellOverlappingEvents(t, i) {
    R = t.slice(0), D = {}, t.forEach((l) => {
      R.shift(), D[l._eid] || (D[l._eid] = { overlaps: [], start: l.start, position: 0 }), D[l._eid].position = 0, R.forEach((s) => {
        D[s._eid] || (D[s._eid] = { overlaps: [], start: s.start, position: 0 });
        const o = this.eventInRange(s, l.start, l.end), a = i.overlapsPerTimeStep ? y.datesInSameTimeStep(l.start, s.start, i.timeStep) : 1;
        if (l.background || l.allDay || s.background || s.allDay || !o || !a) {
          let d, r;
          (d = (D[l._eid] || { overlaps: [] }).overlaps.indexOf(s._eid)) > -1 && D[l._eid].overlaps.splice(d, 1), (r = (D[s._eid] || { overlaps: [] }).overlaps.indexOf(l._eid)) > -1 && D[s._eid].overlaps.splice(r, 1), D[s._eid].position--;
        } else
          D[l._eid].overlaps.push(s._eid), D[l._eid].overlaps = [...new Set(D[l._eid].overlaps)], D[s._eid].overlaps.push(l._eid), D[s._eid].overlaps = [...new Set(D[s._eid].overlaps)], D[s._eid].position++;
      });
    });
    let n = 0;
    for (const l in D) {
      const s = D[l], o = s.overlaps.map((a) => ({ id: a, start: D[a].start }));
      o.push({ id: l, start: s.start }), o.sort((a, d) => a.start < d.start ? -1 : a.start > d.start ? 1 : a.id > d.id ? -1 : 1), s.position = o.findIndex((a) => a.id === l), n = Math.max(this.getOverlapsStreak(s, D), n);
    }
    return [D, n];
  }
  getOverlapsStreak(t, i = {}) {
    let n = t.overlaps.length + 1, l = [];
    return t.overlaps.forEach((s) => {
      l.includes(s) || t.overlaps.filter((o) => o !== s).forEach((o) => {
        i[o].overlaps.includes(s) || l.push(o);
      });
    }), l = [...new Set(l)], n -= l.length, n;
  }
  eventInRange(t, i, n) {
    if (t.allDay || !this._vuecal.time) {
      const o = new Date(t.start).setHours(0, 0, 0, 0);
      return new Date(t.end).setHours(23, 59, 0, 0) >= new Date(i).setHours(0, 0, 0, 0) && o <= new Date(n).setHours(0, 0, 0, 0);
    }
    const l = t.start.getTime(), s = t.end.getTime();
    return l < n.getTime() && s > i.getTime();
  }
}
const he = { class: "vuecal__flex vuecal__weekdays-headings" }, ce = ["onClick"], ve = { class: "vuecal__flex weekday-label", grow: "" }, me = { class: "full" }, pe = { class: "small" }, we = { class: "xsmall" }, ye = { key: 0 }, De = { key: 0, class: "vuecal__flex vuecal__split-days-headers", grow: "" }, B = (e, t) => {
  const i = e.__vccOpts || e;
  for (const [n, l] of t)
    i[n] = l;
  return i;
}, ie = B({ inject: ["vuecal", "utils", "view"], props: { transitionDirection: { type: String, default: "right" }, weekDays: { type: Array, default: () => [] }, switchToNarrowerView: { type: Function, default: () => {
} } }, methods: { selectCell(e, t) {
  e.getTime() !== this.view.selectedDate.getTime() && (this.view.selectedDate = e), this.utils.cell.selectCell(!1, e, t);
}, cleanupHeading: (e) => ({ label: e.full, date: e.date, ...e.today ? { today: e.today } : {} }) }, computed: { headings() {
  if (!["month", "week"].includes(this.view.id))
    return [];
  let e = !1;
  return this.weekDays.map((t, i) => {
    const n = this.utils.date.addDays(this.view.startDate, this.vuecal.startWeekOnSunday ? i - 1 : i);
    return { hide: t.hide, full: t.label, small: t.short || t.label.substr(0, 3), xsmall: t.short || t.label.substr(0, 1), ...this.view.id === "week" ? { dayOfMonth: n.getDate(), date: n, today: !e && this.utils.date.isToday(n) && !e++ } : {} };
  });
}, cellWidth() {
  return 100 / (7 - this.weekDays.reduce((e, t) => e + t.hide, 0));
}, weekdayCellStyles() {
  return { ...this.vuecal.hideWeekdays.length ? { width: `${this.cellWidth}%` } : {} };
}, cellHeadingsClickable() {
  return this.view.id === "week" && (this.vuecal.clickToNavigate || this.vuecal.dblclickToNavigate);
} } }, [["render", function(e, t, i, n, l, s) {
  return h(), c("div", he, [(h(!0), c(T, null, S(s.headings, (o, a) => (h(), c(T, { key: a }, [o.hide ? v("", !0) : (h(), c("div", { key: 0, class: b(["vuecal__flex vuecal__heading", { today: o.today, clickable: s.cellHeadingsClickable }]), style: $(s.weekdayCellStyles), onClick: (d) => s.view.id === "week" && s.selectCell(o.date, d), onDblclick: t[0] || (t[0] = (d) => s.view.id === "week" && s.vuecal.dblclickToNavigate && i.switchToNarrowerView()) }, [P(U, { name: `slide-fade--${i.transitionDirection}`, appear: s.vuecal.transitions }, { default: g(() => [(h(), c("div", { class: "vuecal__flex", column: "", key: !!s.vuecal.transitions && `${a}-${o.dayOfMonth}` }, [k("div", ve, [w(e.$slots, "weekday-heading", { heading: s.cleanupHeading(o), view: s.view }, () => [k("span", me, f(o.full), 1), k("span", pe, f(o.small), 1), k("span", we, f(o.xsmall), 1), o.dayOfMonth ? (h(), c("span", ye, "\xA0" + f(o.dayOfMonth), 1)) : v("", !0)])]), s.vuecal.hasSplits && s.vuecal.stickySplitLabels ? (h(), c("div", De, [(h(!0), c(T, null, S(s.vuecal.daySplits, (d, r) => (h(), c("div", { class: b(["day-split-header", d.class || !1]), key: r }, [w(e.$slots, "split-label", { split: d, view: s.view }, () => [M(f(d.label), 1)])], 2))), 128))])) : v("", !0)]))]), _: 2 }, 1032, ["name", "appear"])], 46, ce))], 64))), 128))]);
}]]), ge = { class: "vuecal__header" }, fe = { key: 0, class: "vuecal__flex vuecal__menu", role: "tablist", "aria-label": "Calendar views navigation" }, _e = ["onDragenter", "onDragleave", "onClick", "aria-label"], ke = { key: 1, class: "vuecal__title-bar" }, be = ["aria-label"], Te = { class: "vuecal__flex vuecal__title", grow: "" }, Ee = ["aria-label"], Ce = { key: 0, class: "vuecal__flex vuecal__split-days-headers" }, Me = B({ inject: ["vuecal", "previous", "next", "switchView", "updateSelectedDate", "modules", "view"], components: { WeekdaysHeadings: ie }, props: { options: { type: Object, default: () => ({}) }, editEvents: { type: Object, required: !0 }, hasSplits: { type: [Boolean, Number], default: !1 }, daySplits: { type: Array, default: () => [] }, viewProps: { type: Object, default: () => ({}) }, weekDays: { type: Array, default: () => [] }, switchToNarrowerView: { type: Function, default: () => {
} } }, data: () => ({ highlightedControl: null }), methods: { goToToday() {
  this.updateSelectedDate(new Date(new Date().setHours(0, 0, 0, 0)));
}, switchToBroaderView() {
  this.transitionDirection = "left", this.broaderView && this.switchView(this.broaderView);
} }, computed: { transitionDirection: { get() {
  return this.vuecal.transitionDirection;
}, set(e) {
  this.vuecal.transitionDirection = e;
} }, broaderView() {
  const { enabledViews: e } = this.vuecal;
  return e[e.indexOf(this.view.id) - 1];
}, showDaySplits() {
  return this.view.id === "day" && this.hasSplits && this.options.stickySplitLabels && !this.options.minSplitWidth;
}, dnd() {
  return this.modules.dnd;
} } }, [["render", function(e, t, i, n, l, s) {
  const o = j("weekdays-headings");
  return h(), c("div", ge, [i.options.hideViewSelector ? v("", !0) : (h(), c("div", fe, [(h(!0), c(T, null, S(i.viewProps.views, (a, d) => (h(), c(T, { key: d }, [a.enabled ? (h(), c("button", { key: 0, class: b(["vuecal__view-btn", { "vuecal__view-btn--active": s.view.id === d, "vuecal__view-btn--highlighted": e.highlightedControl === d }]), type: "button", onDragenter: (r) => i.editEvents.drag && s.dnd && s.dnd.viewSelectorDragEnter(r, d, e.$data), onDragleave: (r) => i.editEvents.drag && s.dnd && s.dnd.viewSelectorDragLeave(r, d, e.$data), onClick: (r) => s.switchView(d, null, !0), "aria-label": `${a.label} view` }, f(a.label), 43, _e)) : v("", !0)], 64))), 128))])), i.options.hideTitleBar ? v("", !0) : (h(), c("div", ke, [k("button", { class: b(["vuecal__arrow vuecal__arrow--prev", { "vuecal__arrow--highlighted": e.highlightedControl === "previous" }]), type: "button", onClick: t[0] || (t[0] = (...a) => s.previous && s.previous(...a)), onDragenter: t[1] || (t[1] = (a) => i.editEvents.drag && s.dnd && s.dnd.viewSelectorDragEnter(a, "previous", e.$data)), onDragleave: t[2] || (t[2] = (a) => i.editEvents.drag && s.dnd && s.dnd.viewSelectorDragLeave(a, "previous", e.$data)), "aria-label": `Previous ${s.view.id}` }, [w(e.$slots, "arrow-prev")], 42, be), k("div", Te, [P(U, { name: i.options.transitions ? `slide-fade--${s.transitionDirection}` : "" }, { default: g(() => [(h(), H(oe(s.broaderView ? "button" : "span"), { type: !!s.broaderView && "button", key: `${s.view.id}${s.view.startDate.toString()}`, onClick: t[3] || (t[3] = (a) => !!s.broaderView && s.switchToBroaderView()), "aria-label": !!s.broaderView && `Go to ${s.broaderView} view` }, { default: g(() => [w(e.$slots, "title")]), _: 3 }, 8, ["type", "aria-label"]))]), _: 3 }, 8, ["name"])]), i.options.todayButton ? (h(), c("button", { key: 0, class: b(["vuecal__today-btn", { "vuecal__today-btn--highlighted": e.highlightedControl === "today" }]), type: "button", onClick: t[4] || (t[4] = (...a) => s.goToToday && s.goToToday(...a)), onDragenter: t[5] || (t[5] = (a) => i.editEvents.drag && s.dnd && s.dnd.viewSelectorDragEnter(a, "today", e.$data)), onDragleave: t[6] || (t[6] = (a) => i.editEvents.drag && s.dnd && s.dnd.viewSelectorDragLeave(a, "today", e.$data)), "aria-label": "Today" }, [w(e.$slots, "today-button")], 34)) : v("", !0), k("button", { class: b(["vuecal__arrow vuecal__arrow--next", { "vuecal__arrow--highlighted": e.highlightedControl === "next" }]), type: "button", onClick: t[7] || (t[7] = (...a) => s.next && s.next(...a)), onDragenter: t[8] || (t[8] = (a) => i.editEvents.drag && s.dnd && s.dnd.viewSelectorDragEnter(a, "next", e.$data)), onDragleave: t[9] || (t[9] = (a) => i.editEvents.drag && s.dnd && s.dnd.viewSelectorDragLeave(a, "next", e.$data)), "aria-label": `Next ${s.view.id}` }, [w(e.$slots, "arrow-next")], 42, Ee)])), i.viewProps.weekDaysInHeader ? (h(), H(o, { key: 2, "week-days": i.weekDays, "transition-direction": s.transitionDirection, "switch-to-narrower-view": i.switchToNarrowerView }, q({ _: 2 }, [e.$slots["weekday-heading"] ? { name: "weekday-heading", fn: g(({ heading: a, view: d }) => [w(e.$slots, "weekday-heading", { heading: a, view: d })]), key: "0" } : void 0, e.$slots["split-label"] ? { name: "split-label", fn: g(({ split: a }) => [w(e.$slots, "split-label", { split: a, view: s.view })]), key: "1" } : void 0]), 1032, ["week-days", "transition-direction", "switch-to-narrower-view"])) : v("", !0), P(U, { name: `slide-fade--${s.transitionDirection}` }, { default: g(() => [s.showDaySplits ? (h(), c("div", Ce, [(h(!0), c(T, null, S(i.daySplits, (a, d) => (h(), c("div", { class: b(["day-split-header", a.class || !1]), key: d }, [w(e.$slots, "split-label", { split: a, view: s.view.id }, () => [M(f(a.label), 1)])], 2))), 128))])) : v("", !0)]), _: 3 }, 8, ["name"])]);
}]]), Se = ["draggable"], Oe = { inject: ["vuecal", "utils", "modules", "view", "domEvents", "editEvents"], props: { cellFormattedDate: { type: String, default: "" }, event: { type: Object, default: () => ({}) }, cellEvents: { type: Array, default: () => [] }, overlaps: { type: Array, default: () => [] }, eventPosition: { type: Number, default: 0 }, overlapsStreak: { type: Number, default: 0 }, allDay: { type: Boolean, default: !1 } }, data: () => ({ touch: { dragThreshold: 30, startX: 0, startY: 0, dragged: !1 } }), methods: { onMouseDown(e, t = !1) {
  if ("ontouchstart" in window && !t)
    return !1;
  const { clickHoldAnEvent: i, focusAnEvent: n, resizeAnEvent: l, dragAnEvent: s } = this.domEvents;
  if (n._eid === this.event._eid && i._eid === this.event._eid)
    return !0;
  this.focusEvent(), i._eid = null, this.vuecal.editEvents.delete && this.event.deletable && (i.timeoutId = setTimeout(() => {
    l._eid || s._eid || (i._eid = this.event._eid, this.event.deleting = !0);
  }, i.timeout));
}, onMouseUp(e) {
  this.domEvents.focusAnEvent._eid !== this.event._eid || this.touch.dragged || (this.domEvents.focusAnEvent.mousedUp = !0), this.touch.dragged = !1;
}, onMouseEnter(e) {
  e.preventDefault(), this.vuecal.emitWithEvent("event-mouse-enter", this.event);
}, onMouseLeave(e) {
  e.preventDefault(), this.vuecal.emitWithEvent("event-mouse-leave", this.event);
}, onTouchMove(e) {
  if (typeof this.vuecal.onEventClick != "function")
    return;
  const { clientX: t, clientY: i } = e.touches[0], { startX: n, startY: l, dragThreshold: s } = this.touch;
  (Math.abs(t - n) > s || Math.abs(i - l) > s) && (this.touch.dragged = !0);
}, onTouchStart(e) {
  this.touch.startX = e.touches[0].clientX, this.touch.startY = e.touches[0].clientY, this.onMouseDown(e, !0);
}, onEnterKeypress(e) {
  if (typeof this.vuecal.onEventClick == "function")
    return this.vuecal.onEventClick(this.event, e);
}, onDblClick(e) {
  if (typeof this.vuecal.onEventDblclick == "function")
    return this.vuecal.onEventDblclick(this.event, e);
}, onDragStart(e) {
  this.dnd && this.dnd.eventDragStart(e, this.event);
}, onDragEnd() {
  this.dnd && this.dnd.eventDragEnd(this.event);
}, onResizeHandleMouseDown() {
  this.focusEvent(), this.domEvents.dragAnEvent._eid = null, this.domEvents.resizeAnEvent = Object.assign(this.domEvents.resizeAnEvent, { _eid: this.event._eid, start: (this.segment || this.event).start, split: this.event.split || null, segment: !!this.segment && this.utils.date.formatDateLite(this.segment.start), originalEnd: new Date((this.segment || this.event).end), originalEndTimeMinutes: this.event.endTimeMinutes }), this.event.resizing = !0;
}, deleteEvent(e = !1) {
  if ("ontouchstart" in window && !e)
    return !1;
  this.utils.event.deleteAnEvent(this.event);
}, touchDeleteEvent(e) {
  this.deleteEvent(!0);
}, cancelDeleteEvent() {
  this.event.deleting = !1;
}, focusEvent() {
  const { focusAnEvent: e } = this.domEvents, t = e._eid;
  if (t !== this.event._eid) {
    if (t) {
      const i = this.view.events.find((n) => n._eid === t);
      i && (i.focused = !1);
    }
    this.vuecal.cancelDelete(), this.vuecal.emitWithEvent("event-focus", this.event), e._eid = this.event._eid, this.event.focused = !0;
  }
} }, computed: { eventDimensions() {
  const { startTimeMinutes: e, endTimeMinutes: t } = this.segment || this.event;
  let i = e - this.vuecal.timeFrom;
  const n = Math.max(Math.round(i * this.vuecal.timeCellHeight / this.vuecal.timeStep), 0);
  i = Math.min(t, this.vuecal.timeTo) - this.vuecal.timeFrom;
  const l = Math.round(i * this.vuecal.timeCellHeight / this.vuecal.timeStep);
  return { top: n, height: Math.max(l - n, 5) };
}, eventStyles() {
  if (this.event.allDay || !this.vuecal.time || !this.event.endTimeMinutes || this.view.id === "month" || this.allDay)
    return {};
  let e = 100 / Math.min(this.overlaps.length + 1, this.overlapsStreak), t = 100 / (this.overlaps.length + 1) * this.eventPosition;
  this.vuecal.minEventWidth && e < this.vuecal.minEventWidth && (e = this.vuecal.minEventWidth, t = (100 - this.vuecal.minEventWidth) / this.overlaps.length * this.eventPosition);
  const { top: i, height: n } = this.eventDimensions;
  return { top: `${i}px`, height: `${n}px`, width: `${e}%`, left: this.event.left && `${this.event.left}px` || `${t}%` };
}, eventClasses() {
  const { isFirstDay: e, isLastDay: t } = this.segment || {};
  return { [this.event.class]: !!this.event.class, "vuecal__event--focus": this.event.focused, "vuecal__event--resizing": this.event.resizing, "vuecal__event--background": this.event.background, "vuecal__event--deletable": this.event.deleting, "vuecal__event--all-day": this.event.allDay, "vuecal__event--dragging": !this.event.draggingStatic && this.event.dragging, "vuecal__event--static": this.event.dragging && this.event.draggingStatic, "vuecal__event--multiple-days": !!this.segment, "event-start": this.segment && e && !t, "event-middle": this.segment && !e && !t, "event-end": this.segment && t && !e };
}, segment() {
  return this.event.segments && this.event.segments[this.cellFormattedDate] || null;
}, draggable() {
  const { draggable: e, background: t, daysCount: i } = this.event;
  return this.vuecal.editEvents.drag && e && !t && i === 1;
}, resizable() {
  const { editEvents: e, time: t } = this.vuecal;
  return e.resize && this.event.resizable && t && !this.allDay && (!this.segment || this.segment && this.segment.isLastDay) && this.view.id !== "month";
}, dnd() {
  return this.modules.dnd;
} } }, $e = ["data-split", "aria-label", "onTouchstart", "onMousedown", "onDragover", "onDrop"], xe = { key: 0, class: "cell-time-labels" }, We = ["innerHTML"], He = { key: 2, class: "vuecal__cell-events" }, Ve = ["title"], se = B({ inject: ["vuecal", "utils", "modules", "view", "domEvents"], components: { Event: B(Oe, [["render", function(e, t, i, n, l, s) {
  return h(), c("div", { class: b(["vuecal__event", s.eventClasses]), style: $(s.eventStyles), tabindex: "0", onFocus: t[4] || (t[4] = (...o) => s.focusEvent && s.focusEvent(...o)), onKeypress: t[5] || (t[5] = X(L((...o) => s.onEnterKeypress && s.onEnterKeypress(...o), ["stop"]), ["enter"])), onMouseenter: t[6] || (t[6] = (...o) => s.onMouseEnter && s.onMouseEnter(...o)), onMouseleave: t[7] || (t[7] = (...o) => s.onMouseLeave && s.onMouseLeave(...o)), onTouchstart: t[8] || (t[8] = L((...o) => s.onTouchStart && s.onTouchStart(...o), ["stop"])), onMousedown: t[9] || (t[9] = (o) => s.onMouseDown(o)), onMouseup: t[10] || (t[10] = (...o) => s.onMouseUp && s.onMouseUp(...o)), onTouchend: t[11] || (t[11] = (...o) => s.onMouseUp && s.onMouseUp(...o)), onTouchmove: t[12] || (t[12] = (...o) => s.onTouchMove && s.onTouchMove(...o)), onDblclick: t[13] || (t[13] = (...o) => s.onDblClick && s.onDblClick(...o)), draggable: s.draggable, onDragstart: t[14] || (t[14] = (o) => s.draggable && s.onDragStart(o)), onDragend: t[15] || (t[15] = (o) => s.draggable && s.onDragEnd()) }, [s.vuecal.editEvents.delete && i.event.deletable ? (h(), c("div", { key: 0, class: "vuecal__event-delete", onClick: t[0] || (t[0] = L((...o) => s.deleteEvent && s.deleteEvent(...o), ["stop"])), onTouchstart: t[1] || (t[1] = L((...o) => s.touchDeleteEvent && s.touchDeleteEvent(...o), ["stop"])) }, f(s.vuecal.texts.deleteEvent), 33)) : v("", !0), w(e.$slots, "event", { event: i.event, view: s.view.id }), s.resizable ? (h(), c("div", { key: 1, class: "vuecal__event-resize-handle", contenteditable: "false", onMousedown: t[2] || (t[2] = L((...o) => s.onResizeHandleMouseDown && s.onResizeHandleMouseDown(...o), ["stop", "prevent"])), onTouchstart: t[3] || (t[3] = L((...o) => s.onResizeHandleMouseDown && s.onResizeHandleMouseDown(...o), ["stop", "prevent"])) }, null, 32)) : v("", !0)], 46, Se);
}]]) }, props: { options: { type: Object, default: () => ({}) }, editEvents: { type: Object, required: !0 }, data: { type: Object, required: !0 }, cellSplits: { type: Array, default: () => [] }, minTimestamp: { type: [Number, null], default: null }, maxTimestamp: { type: [Number, null], default: null }, cellWidth: { type: [Number, Boolean], default: !1 }, allDay: { type: Boolean, default: !1 } }, data: () => ({ cellOverlaps: {}, cellOverlapsStreak: 1, timeAtCursor: null, highlighted: !1, highlightedSplit: null }), methods: { getSplitAtCursor({ target: e }) {
  let t = e.classList.contains("vuecal__cell-split") ? e : this.vuecal.findAncestor(e, "vuecal__cell-split");
  return t && (t = t.attributes["data-split"].value, parseInt(t).toString() === t.toString() && (t = parseInt(t))), t || null;
}, splitClasses(e) {
  return { "vuecal__cell-split": !0, "vuecal__cell-split--highlighted": this.highlightedSplit === e.id, [e.class]: !!e.class };
}, checkCellOverlappingEvents() {
  this.options.time && this.eventsCount && !this.splitsCount && (this.eventsCount === 1 ? (this.cellOverlaps = [], this.cellOverlapsStreak = 1) : [this.cellOverlaps, this.cellOverlapsStreak] = this.utils.event.checkCellOverlappingEvents(this.events, this.options));
}, isDOMElementAnEvent(e) {
  return this.vuecal.isDOMElementAnEvent(e);
}, selectCell(e, t = !1) {
    const i = this.splitsCount ? this.getSplitAtCursor(e) : null;
    this.utils.cell.selectCell(t, this.timeAtCursor, i), this.timeAtCursor = null;
// тут селект
}, onCellkeyPressEnter(e) {
  this.isSelected || this.onCellFocus(e);
  const t = this.splitsCount ? this.getSplitAtCursor(e) : null;
  this.utils.cell.keyPressEnterCell(this.timeAtCursor, t), this.timeAtCursor = null;
}, onCellFocus(e) {
  if (!this.isSelected && !this.isDisabled) {
    this.isSelected = this.data.startDate;
    const t = this.splitsCount ? this.getSplitAtCursor(e) : null, i = this.timeAtCursor || this.data.startDate;
    this.vuecal.$emit("cell-focus", t ? { date: i, split: t } : i);
  }
}, onCellMouseDown(e, t = null, i = !1) {
  if ("ontouchstart" in window && !i)
    return !1;
  this.isSelected || this.onCellFocus(e);
  const { clickHoldACell: n, focusAnEvent: l } = this.domEvents;
  this.domEvents.cancelClickEventCreation = !1, n.eventCreated = !1, this.timeAtCursor = new Date(this.data.startDate);
  const { minutes: s, cursorCoords: { y: o } } = this.vuecal.minutesAtCursor(e);
  this.timeAtCursor.setMinutes(s);
  const a = this.isDOMElementAnEvent(e.target);
  !a && l._eid && ((this.view.events.find((d) => d._eid === l._eid) || {}).focused = !1), this.editEvents.create && !a && this.setUpEventCreation(e, o);
}, setUpEventCreation(e, t) {
  if (this.options.dragToCreateEvent && ["week", "day"].includes(this.view.id)) {
    const { dragCreateAnEvent: i } = this.domEvents;
    if (i.startCursorY = t, i.split = this.splitsCount ? this.getSplitAtCursor(e) : null, i.start = this.timeAtCursor, this.options.snapToTime) {
      let n = 60 * this.timeAtCursor.getHours() + this.timeAtCursor.getMinutes();
      const l = n + this.options.snapToTime / 2;
      n = l - l % this.options.snapToTime, i.start.setHours(0, n, 0, 0);
    }
  } else
    this.options.cellClickHold && ["month", "week", "day"].includes(this.view.id) && this.setUpCellHoldTimer(e);
}, setUpCellHoldTimer(e) {
  const { clickHoldACell: t } = this.domEvents;
  t.cellId = `${this.vuecal._.uid}_${this.data.formattedDate}`, t.split = this.splitsCount ? this.getSplitAtCursor(e) : null, t.timeoutId = setTimeout(() => {
    if (t.cellId && !this.domEvents.cancelClickEventCreation) {
      const { _eid: i } = this.utils.event.createAnEvent(this.timeAtCursor, null, t.split ? { split: t.split } : {});
      t.eventCreated = i;
    }
  }, t.timeout);
}, onCellTouchStart(e, t = null) {
  this.onCellMouseDown(e, t, !0);
}, onCellClick(e) {
  this.isDOMElementAnEvent(e.target) || this.selectCell(e);
}, onCellDblClick(e) {
  const t = new Date(this.data.startDate);
  t.setMinutes(this.vuecal.minutesAtCursor(e).minutes);
  const i = this.splitsCount ? this.getSplitAtCursor(e) : null;
  this.vuecal.$emit("cell-dblclick", i ? { date: t, split: i } : t), this.options.dblclickToNavigate && this.vuecal.switchToNarrowerView();
}, onCellContextMenu(e) {
  e.stopPropagation(), e.preventDefault();
  const t = new Date(this.data.startDate), { cursorCoords: i, minutes: n } = this.vuecal.minutesAtCursor(e);
  t.setMinutes(n);
  const l = this.splitsCount ? this.getSplitAtCursor(e) : null;
  this.vuecal.$emit("cell-contextmenu", { date: t, ...i, ...l || {}, e });
} }, computed: { dnd() {
  return this.modules.dnd;
}, nowInMinutes() {
  return this.utils.date.dateToMinutes(this.vuecal.now);
}, isBeforeMinDate() {
  return this.minTimestamp !== null && this.minTimestamp > this.data.endDate.getTime();
}, isAfterMaxDate() {
  return this.maxTimestamp && this.maxTimestamp < this.data.startDate.getTime();
}, isDisabled() {
  const { disableDays: e } = this.options, { isYearsOrYearView: t } = this.vuecal;
  return !(!e.length || !e.includes(this.data.formattedDate) || t);
}, isSelected: { get() {
  let e = !1;
  const { selectedDate: t } = this.view;
  return e = this.view.id === "years" ? t.getFullYear() === this.data.startDate.getFullYear() : this.view.id === "year" ? t.getFullYear() === this.data.startDate.getFullYear() && t.getMonth() === this.data.startDate.getMonth() : t.getTime() === this.data.startDate.getTime(), e;
}, set(e) {
  this.view.selectedDate = e, this.vuecal.$emit("update:selected-date", this.view.selectedDate);
} }, isWeekOrDayView() {
  return ["week", "day"].includes(this.view.id);
}, transitionDirection() {
  return this.vuecal.transitionDirection;
}, specialHours() {
  return this.data.specialHours.map((e) => {
    let { from: t, to: i } = e;
    return t = Math.max(t, this.options.timeFrom), i = Math.min(i, this.options.timeTo), { ...e, height: (i - t) * this.timeScale, top: (t - this.options.timeFrom) * this.timeScale };
  });
}, events() {
  const { startDate: e, endDate: t } = this.data;
  let i = [];
  if (!["years", "year"].includes(this.view.id) || this.options.eventsCountOnYearView) {
    if (i = this.view.events.slice(0), this.view.id === "month" && i.push(...this.view.outOfScopeEvents), i = i.filter((n) => this.utils.event.eventInRange(n, e, t)), this.options.showAllDayEvents && this.view.id !== "month" && (i = i.filter((n) => !!n.allDay === this.allDay)), this.options.time && this.isWeekOrDayView && !this.allDay) {
      const { timeFrom: n, timeTo: l } = this.options;
      i = i.filter((s) => {
        const o = s.daysCount > 1 && s.segments[this.data.formattedDate] || {}, a = s.daysCount === 1 && s.startTimeMinutes < l && s.endTimeMinutes > n, d = s.daysCount > 1 && o.startTimeMinutes < l && o.endTimeMinutes > n;
        return s.allDay || a || d || !1;
      });
    }
    !this.options.time || !this.isWeekOrDayView || this.options.showAllDayEvents && this.allDay || i.sort((n, l) => n.start < l.start ? -1 : 1), this.cellSplits.length || this.$nextTick(this.checkCellOverlappingEvents);
  }
  return i;
}, eventsCount() {
  return this.events.length;
}, splits() {
  return this.cellSplits.map((e, t) => {
    const i = this.events.filter((s) => s.split === e.id), [n, l] = this.utils.event.checkCellOverlappingEvents(i.filter((s) => !s.background && !s.allDay), this.options);
    return { ...e, overlaps: n, overlapsStreak: l, events: i };
  });
}, splitsCount() {
  return this.splits.length;
}, cellClasses() {
    // добавление классов ячейкам
  return { [this.data.class]: !!this.data.class, "vuecal__cell--current": this.data.current, "vuecal__cell--today": this.data.today, "vuecal__cell--out-of-scope": this.data.outOfScope, "vuecal__cell--before-min":this.isBeforeMinDate, "vuecal__cell--after-max": this.isDisabled && this.isAfterMaxDate, "vuecal__cell--disabled": this.isDisabled, "vuecal__cell--selected": this.isSelected, "vuecal__cell--highlighted": this.highlighted, "vuecal__cell--has-splits": this.splitsCount, "vuecal__cell--has-events": this.eventsCount };
}, cellStyles() {
  return { ...this.cellWidth ? { width: `${this.cellWidth}%` } : {} };
}, timelineVisible() {
  const { time: e, timeTo: t } = this.options;
  return this.data.today && this.isWeekOrDayView && e && !this.allDay && this.nowInMinutes <= t;
}, todaysTimePosition() {
  if (!this.data.today || !this.options.time)
    return;
  const e = this.nowInMinutes - this.options.timeFrom;
  return Math.round(e * this.timeScale);
}, timeScale() {
  return this.options.timeCellHeight / this.options.timeStep;
} } }, [["render", function(e, t, i, n, l, s) {
  const o = j("event");
  return h(), H(re, { class: b(["vuecal__cell", s.cellClasses]), name: `slide-fade--${s.transitionDirection}`, tag: "div", appear: i.options.transitions, style: $(s.cellStyles) }, { default: g(() => [(h(!0), c(T, null, S(s.splitsCount ? s.splits : 1, (a, d) => (h(), c("div", { class: b(["vuecal__flex vuecal__cell-content", s.splitsCount && s.splitClasses(a)]), key: i.options.transitions ? `${s.view.id}-${i.data.content}-${d}` : d, "data-split": !!s.splitsCount && a.id, column: "", tabindex: "0", "aria-label": i.data.content, onFocus: t[0] || (t[0] = (r) => s.onCellFocus(r)), onKeypress: t[1] || (t[1] = X((r) => s.onCellkeyPressEnter(r), ["enter"])), onTouchstart: (r) => !s.isDisabled && s.onCellTouchStart(r, s.splitsCount ? a.id : null), onMousedown: (r) => !s.isDisabled && s.onCellMouseDown(r, s.splitsCount ? a.id : null), onClick: t[2] || (t[2] = (r) => !s.isDisabled && s.onCellClick(r)), onDblclick: t[3] || (t[3] = (r) => !s.isDisabled && s.onCellDblClick(r)), onContextmenu: t[4] || (t[4] = (r) => !s.isDisabled && i.options.cellContextmenu && s.onCellContextMenu(r)), onDragenter: t[5] || (t[5] = (r) => !s.isDisabled && i.editEvents.drag && s.dnd && s.dnd.cellDragEnter(r, e.$data, i.data.startDate)), onDragover: (r) => !s.isDisabled && i.editEvents.drag && s.dnd && s.dnd.cellDragOver(r, e.$data, i.data.startDate, s.splitsCount ? a.id : null), onDragleave: t[6] || (t[6] = (r) => !s.isDisabled && i.editEvents.drag && s.dnd && s.dnd.cellDragLeave(r, e.$data, i.data.startDate)), onDrop: (r) => !s.isDisabled && i.editEvents.drag && s.dnd && s.dnd.cellDragDrop(r, e.$data, i.data.startDate, s.splitsCount ? a.id : null) }, [i.options.showTimeInCells && i.options.time && s.isWeekOrDayView && !i.allDay ? (h(), c("div", xe, [(h(!0), c(T, null, S(s.vuecal.timeCells, (r, u) => (h(), c("span", { class: "cell-time-label", key: u }, f(r.label), 1))), 128))])) : v("", !0), s.isWeekOrDayView && !i.allDay && s.specialHours.length ? (h(!0), c(T, { key: 1 }, S(s.specialHours, (r, u) => (h(), c("div", { class: b(["vuecal__special-hours", `vuecal__special-hours--day${r.day} ${r.class}`]), style: $(`height: ${r.height}px;top: ${r.top}px`) }, [r.label ? (h(), c("div", { key: 0, class: "special-hours-label", innerHTML: r.label }, null, 8, We)) : v("", !0)], 6))), 256)) : v("", !0), w(e.$slots, "cell-content", { events: s.events, selectCell: (r) => s.selectCell(r, !0), split: !!s.splitsCount && a }), s.eventsCount && (s.isWeekOrDayView || s.view.id === "month" && i.options.eventsOnMonthView) ? (h(), c("div", He, [(h(!0), c(T, null, S(s.splitsCount ? a.events : s.events, (r, u) => (h(), H(o, { key: u, "cell-formatted-date": i.data.formattedDate, event: r, "all-day": i.allDay, "cell-events": s.splitsCount ? a.events : s.events, overlaps: ((s.splitsCount ? a.overlaps[r._eid] : e.cellOverlaps[r._eid]) || []).overlaps, "event-position": ((s.splitsCount ? a.overlaps[r._eid] : e.cellOverlaps[r._eid]) || []).position, "overlaps-streak": s.splitsCount ? a.overlapsStreak : e.cellOverlapsStreak }, { event: g(({ event: m, view: p }) => [w(e.$slots, "event", { view: p, event: m })]), _: 2 }, 1032, ["cell-formatted-date", "event", "all-day", "cell-events", "overlaps", "event-position", "overlaps-streak"]))), 128))])) : v("", !0)], 42, $e))), 128)), s.timelineVisible ? (h(), c("div", { class: "vuecal__now-line", style: $(`top: ${s.todaysTimePosition}px`), key: i.options.transitions ? `${s.view.id}-now-line` : "now-line", title: s.utils.date.formatTime(s.vuecal.now) }, null, 12, Ve)) : v("", !0)]), _: 3 }, 8, ["class", "name", "appear", "style"]);
}]]), Ae = { key: 0, class: "vuecal__all-day-text", style: { width: "3em" } }, je = B({ inject: ["vuecal", "view", "editEvents"], components: { "vuecal-cell": se }, props: { options: { type: Object, required: !0 }, cells: { type: Array, required: !0 }, label: { type: String, required: !0 }, daySplits: { type: Array, default: () => [] }, shortEvents: { type: Boolean, default: !0 }, height: { type: String, default: "" }, cellOrSplitMinWidth: { type: Number, default: null } }, computed: { hasCellOrSplitWidth() {
  return !!(this.options.minCellWidth || this.daySplits.length && this.options.minSplitWidth);
} } }, [["render", function(e, t, i, n, l, s) {
  const o = j("vuecal-cell");
  return h(), c("div", { class: "vuecal__flex vuecal__all-day", style: $(i.cellOrSplitMinWidth && { height: i.height }) }, [i.cellOrSplitMinWidth ? v("", !0) : (h(), c("div", Ae, [k("span", null, f(i.label), 1)])), k("div", { class: b(["vuecal__flex vuecal__cells", `${s.view.id}-view`]), grow: "", style: $(i.cellOrSplitMinWidth ? `min-width: ${i.cellOrSplitMinWidth}px` : "") }, [(h(!0), c(T, null, S(i.cells, (a, d) => (h(), H(o, { key: d, options: i.options, "edit-events": s.editEvents, data: a, "all-day": !0, "cell-width": i.options.hideWeekdays.length && (s.vuecal.isWeekView || s.vuecal.isMonthView) && s.vuecal.cellWidth, "min-timestamp": i.options.minTimestamp, "max-timestamp": i.options.maxTimestamp, "cell-splits": i.daySplits }, { event: g(({ event: r, view: u }) => [w(e.$slots, "event", { view: u, event: r })]), _: 2 }, 1032, ["options", "edit-events", "data", "cell-width", "min-timestamp", "max-timestamp", "cell-splits"]))), 128))], 6)], 4);
}]]), Ye = ["lang"], Le = k("i", { class: "angle" }, null, -1), Fe = k("i", { class: "angle" }, null, -1), Be = { class: "default" }, Ne = { key: 0, class: "vuecal__flex vuecal__body", grow: "" }, Ie = ["onBlur", "innerHTML"], ze = ["innerHTML"], Pe = ["innerHTML"], Ue = { class: "vuecal__flex", row: "", grow: "" }, Re = { key: 0, class: "vuecal__time-column" }, qe = k("span", { class: "vuecal__time-cell-line" }, null, -1), Ke = { class: "vuecal__time-cell-label" }, Xe = { key: 1, class: "vuecal__flex vuecal__week-numbers", column: "" }, Ge = ["wrap", "column"], Ze = ["onBlur", "innerHTML"], Je = ["innerHTML"], Qe = ["innerHTML"], et = ["wrap"], tt = ["innerHTML"], it = ["innerHTML"], st = { key: 2, class: "vuecal__cell-events-count" }, nt = { key: 3, class: "vuecal__no-event" }, at = ["onBlur", "innerHTML"], lt = ["innerHTML"], ot = { key: 2, class: "vuecal__event-time" }, rt = { key: 0 }, dt = { key: 1, class: "days-to-end" }, ut = ["innerHTML"], ht = { key: 0, class: "vuecal__scrollbar-check" }, ct = [k("div", null, null, -1)], z = { weekDays: Array(7).fill(""), weekDaysShort: [], months: Array(12).fill(""), years: "", year: "", month: "", week: "", day: "", today: "", noEvent: "", allDay: "", deleteEvent: "", createEvent: "", dateFormat: "dddd MMMM D, YYYY", am: "am", pm: "pm" }, ee = ["years", "year", "month", "week", "day"], te = new class {
  constructor(e, t = !1) {
    W(this, "texts", {});
    W(this, "dateToMinutes", (e) => 60 * e.getHours() + e.getMinutes());
    O = this, this._texts = e, t || !Date || Date.prototype.addDays || this._initDatePrototypes();
  }
  _initDatePrototypes() {
    Date.prototype.addDays = function(e) {
      return O.addDays(this, e);
    }, Date.prototype.subtractDays = function(e) {
      return O.subtractDays(this, e);
    }, Date.prototype.addHours = function(e) {
      return O.addHours(this, e);
    }, Date.prototype.subtractHours = function(e) {
      return O.subtractHours(this, e);
    }, Date.prototype.addMinutes = function(e) {
      return O.addMinutes(this, e);
    }, Date.prototype.subtractMinutes = function(e) {
      return O.subtractMinutes(this, e);
    }, Date.prototype.getWeek = function() {
      return O.getWeek(this);
    }, Date.prototype.isToday = function() {
      return O.isToday(this);
    }, Date.prototype.isLeapYear = function() {
      return O.isLeapYear(this);
    }, Date.prototype.format = function(e = "YYYY-MM-DD") {
      return O.formatDate(this, e);
    }, Date.prototype.formatTime = function(e = "HH:mm") {
      return O.formatTime(this, e);
    };
  }
  removePrototypes() {
    delete Date.prototype.addDays, delete Date.prototype.subtractDays, delete Date.prototype.addHours, delete Date.prototype.subtractHours, delete Date.prototype.addMinutes, delete Date.prototype.subtractMinutes, delete Date.prototype.getWeek, delete Date.prototype.isToday, delete Date.prototype.isLeapYear, delete Date.prototype.format, delete Date.prototype.formatTime;
  }
  updateTexts(e) {
    this._texts = e;
  }
  _todayFormatted() {
    return J !== new Date().getDate() && (N = new Date(), J = N.getDate(), Q = `${N.getFullYear()}-${N.getMonth()}-${N.getDate()}`), Q;
  }
  addDays(e, t) {
    const i = new Date(e.valueOf());
    return i.setDate(i.getDate() + t), i;
  }
  subtractDays(e, t) {
    const i = new Date(e.valueOf());
    return i.setDate(i.getDate() - t), i;
  }
  addHours(e, t) {
    const i = new Date(e.valueOf());
    return i.setHours(i.getHours() + t), i;
  }
  subtractHours(e, t) {
    const i = new Date(e.valueOf());
    return i.setHours(i.getHours() - t), i;
  }
  addMinutes(e, t) {
    const i = new Date(e.valueOf());
    return i.setMinutes(i.getMinutes() + t), i;
  }
  subtractMinutes(e, t) {
    const i = new Date(e.valueOf());
    return i.setMinutes(i.getMinutes() - t), i;
  }
  getWeek(e) {
    const t = new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())), i = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - i);
    const n = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - n) / 864e5 + 1) / 7);
  }
  isToday(e) {
    return `${e.getFullYear()}-${e.getMonth()}-${e.getDate()}` === this._todayFormatted();
  }
  isLeapYear(e) {
    const t = e.getFullYear();
    return !(t % 400) || t % 100 && !(t % 4);
  }
  getPreviousFirstDayOfWeek(e = null, t) {
    const i = e && new Date(e.valueOf()) || new Date(), n = t ? 7 : 6;
    return i.setDate(i.getDate() - (i.getDay() + n) % 7), i;
  }
  stringToDate(e) {
    return e instanceof Date ? e : (e.length === 10 && (e += " 00:00"), new Date(e.replace(/-/g, "/")));
  }
  countDays(e, t) {
    typeof e == "string" && (e = e.replace(/-/g, "/")), typeof t == "string" && (t = t.replace(/-/g, "/")), e = new Date(e).setHours(0, 0, 0, 0), t = new Date(t).setHours(0, 0, 1, 0);
    const i = 60 * (new Date(t).getTimezoneOffset() - new Date(e).getTimezoneOffset()) * 1e3;
    return Math.ceil((t - e - i) / 864e5);
  }
  datesInSameTimeStep(e, t, i) {
    return Math.abs(e.getTime() - t.getTime()) <= 60 * i * 1e3;
  }
  formatDate(e, t = "YYYY-MM-DD", i = null) {
    if (i || (i = this._texts), t || (t = "YYYY-MM-DD"), t === "YYYY-MM-DD")
      return this.formatDateLite(e);
    I = {}, F = {};
    const n = { YYYY: () => this._hydrateDateObject(e, i).YYYY, YY: () => this._hydrateDateObject(e, i).YY(), M: () => this._hydrateDateObject(e, i).M, MM: () => this._hydrateDateObject(e, i).MM(), MMM: () => this._hydrateDateObject(e, i).MMM(), MMMM: () => this._hydrateDateObject(e, i).MMMM(), MMMMG: () => this._hydrateDateObject(e, i).MMMMG(), D: () => this._hydrateDateObject(e, i).D, DD: () => this._hydrateDateObject(e, i).DD(), S: () => this._hydrateDateObject(e, i).S(), d: () => this._hydrateDateObject(e, i).d, dd: () => this._hydrateDateObject(e, i).dd(), ddd: () => this._hydrateDateObject(e, i).ddd(), dddd: () => this._hydrateDateObject(e, i).dddd(), HH: () => this._hydrateTimeObject(e, i).HH, H: () => this._hydrateTimeObject(e, i).H, hh: () => this._hydrateTimeObject(e, i).hh, h: () => this._hydrateTimeObject(e, i).h, am: () => this._hydrateTimeObject(e, i).am, AM: () => this._hydrateTimeObject(e, i).AM, mm: () => this._hydrateTimeObject(e, i).mm, m: () => this._hydrateTimeObject(e, i).m };
    return t.replace(/(\{[a-zA-Z]+\}|[a-zA-Z]+)/g, (l, s) => {
      const o = n[s.replace(/\{|\}/g, "")];
      return o !== void 0 ? o() : s;
    });
  }
  formatDateLite(e) {
    const t = e.getMonth() + 1, i = e.getDate();
    return `${e.getFullYear()}-${t < 10 ? "0" : ""}${t}-${i < 10 ? "0" : ""}${i}`;
  }
  formatTime(e, t = "HH:mm", i = null, n = !1) {
    let l = !1;
    if (n) {
      const [a, d, r] = [e.getHours(), e.getMinutes(), e.getSeconds()];
      a + d + r === 141 && (l = !0);
    }
    if (e instanceof Date && t === "HH:mm")
      return l ? "24:00" : this.formatTimeLite(e);
    F = {}, i || (i = this._texts);
    const s = this._hydrateTimeObject(e, i), o = t.replace(/(\{[a-zA-Z]+\}|[a-zA-Z]+)/g, (a, d) => {
      const r = s[d.replace(/\{|\}/g, "")];
      return r !== void 0 ? r : d;
    });
    return l ? o.replace("23:59", "24:00") : o;
  }
  formatTimeLite(e) {
    const t = e.getHours(), i = e.getMinutes();
    return `${(t < 10 ? "0" : "") + t}:${(i < 10 ? "0" : "") + i}`;
  }
  _nth(e) {
    if (e > 3 && e < 21)
      return "th";
    switch (e % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:D
        return "th";
    }
  }
  _hydrateDateObject(e, t) {
    if (I.D)
      return I;
    const i = e.getFullYear(), n = e.getMonth() + 1, l = e.getDate(), s = (e.getDay() - 1 + 7) % 7;
    return I = { YYYY: i, YY: () => i.toString().substring(2), M: n, MM: () => (n < 10 ? "0" : "") + n, MMM: () => t.months[n - 1].substring(0, 3), MMMM: () => t.months[n - 1], MMMMG: () => (t.monthsGenitive || t.months)[n - 1], D: l, DD: () => (l < 10 ? "0" : "") + l, S: () => this._nth(l), d: s + 1, dd: () => t.weekDays[s][0], ddd: () => t.weekDays[s].substr(0, 3), dddd: () => t.weekDays[s] }, I;
  }
  _hydrateTimeObject(e, t) {
    if (F.am)
      return F;
    let i, n;
    e instanceof Date ? (i = e.getHours(), n = e.getMinutes()) : (i = Math.floor(e / 60), n = Math.floor(e % 60));
    const l = i % 12 ? i % 12 : 12, s = (t || { am: "am", pm: "pm" })[i === 24 || i < 12 ? "am" : "pm"];
    return F = { H: i, h: l, HH: (i < 10 ? "0" : "") + i, hh: (l < 10 ? "0" : "") + l, am: s, AM: s.toUpperCase(), m: n, mm: (n < 10 ? "0" : "") + n }, F;
  }
}(z), vt = { name: "vue-cal-m", components: { "vuecal-cell": se, "vuecal-header": Me, WeekdaysHeadings: ie, AllDayBar: je }, provide() {
  return { vuecal: this, utils: this.utils, modules: this.modules, previous: this.previous, next: this.next, switchView: this.switchView, updateSelectedDate: this.updateSelectedDate, editEvents: this.editEvents, view: this.view, domEvents: this.domEvents };
}, props: { activeView: { type: String, default: "week" }, allDayBarHeight: { type: [String, Number], default: "25px" }, cellClickHold: { type: Boolean, default: !0 }, cellContextmenu: { type: Boolean, default: !1 }, clickToNavigate: { type: Boolean, default: !1 }, dblclickToNavigate: { type: Boolean, default: !0 }, disableDatePrototypes: { type: Boolean, default: !1 }, disableDays: { type: Array, default: () => [] }, disableViews: { type: Array, default: () => [] }, dragToCreateEvent: { type: Boolean, default: !0 }, dragToCreateThreshold: { type: Number, default: 15 }, editableEvents: { type: [Boolean, Object], default: !1 }, events: { type: Array, default: () => [] }, eventsCountOnYearView: { type: Boolean, default: !1 }, eventsOnMonthView: { type: [Boolean, String], default: !1 }, hideBody: { type: Boolean, default: !1 }, hideTitleBar: { type: Boolean, default: !1 }, hideViewSelector: { type: Boolean, default: !1 }, hideWeekdays: { type: Array, default: () => [] }, hideWeekends: { type: Boolean, default: !1 }, locale: { type: [String, Object], default: "en" }, maxDate: { type: [String, Date], default: "" }, minCellWidth: { type: Number, default: 0 }, minDate: { type: [String, Date], default: "" }, minEventWidth: { type: Number, default: 0 }, minSplitWidth: { type: Number, default: 0 }, onEventClick: { type: [Function, null], default: null }, onEventCreate: { type: [Function, null], default: null }, onEventDblclick: { type: [Function, null], default: null }, overlapsPerTimeStep: { type: Boolean, default: !1 }, resizeX: { type: Boolean, default: !1 }, selectedDate: { type: [String, Date], default: "" }, showAllDayEvents: { type: [Boolean, String], default: !1 }, showTimeInCells: { type: Boolean, default: !1 }, showWeekNumbers: { type: [Boolean, String], default: !1 }, snapToTime: { type: Number, default: 0 }, small: { type: Boolean, default: !1 }, specialHours: { type: Object, default: () => ({}) }, splitDays: { type: Array, default: () => [] }, startWeekOnSunday: { type: Boolean, default: !1 }, stickySplitLabels: { type: Boolean, default: !1 }, time: { type: Boolean, default: !0 }, timeCellHeight: { type: Number, default: 40 }, timeFormat: { type: String, default: "" }, timeFrom: { type: Number, default: 0 }, timeStep: { type: Number, default: 60 }, timeTo: { type: Number, default: 1440 }, todayButton: { type: Boolean, default: !1 }, transitions: { type: Boolean, default: !0 }, twelveHour: { type: Boolean, default: !1 }, watchRealTime: { type: Boolean, default: !1 }, xsmall: { type: Boolean, default: !1 } }, data() {
  return { ready: !1, texts: { ...z }, utils: { date: !!this.disableDatePrototypes && te.removePrototypes() || te, cell: null, event: null }, modules: { dnd: null }, cellsEl: null, view: { id: "", title: "", startDate: null, endDate: null, firstCellDate: null, lastCellDate: null, selectedDate: null, events: [] }, eventIdIncrement: 1, now: new Date(), timeTickerIds: [null, null], domEvents: { resizeAnEvent: { _eid: null, start: null, split: null, segment: null, originalEndTimeMinutes: 0, originalEnd: null, end: null, startCell: null, endCell: null }, dragAnEvent: { _eid: null }, dragCreateAnEvent: { startCursorY: null, start: null, split: null, event: null }, focusAnEvent: { _eid: null, mousedUp: !1 }, clickHoldAnEvent: { _eid: null, timeout: 1200, timeoutId: null }, dblTapACell: { taps: 0, timeout: 500 }, clickHoldACell: { cellId: null, split: null, timeout: 1200, timeoutId: null, eventCreated: !1 }, cancelClickEventCreation: !1 }, mutableEvents: [], transitionDirection: "right" };
}, methods: { async loadLocale(e) {
  if (typeof this.locale == "object")
    return this.texts = Object.assign({}, z, e), void this.utils.date.updateTexts(this.texts);
  if (this.locale === "en") {
    const t = await import("./i18n/en.es.js");
    this.texts = Object.assign({}, z, t);
  } else
    ((t, i) => {
      const n = t[i];
      return n ? typeof n == "function" ? n() : Promise.resolve(n) : new Promise((l, s) => {
        (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(s.bind(null, new Error("Unknown variable dynamic import: " + i)));
      });
    })(Object.assign({ "./i18n/ar.json": () => import("./i18n/ar.es.js"), "./i18n/bg.json": () => import("./i18n/bg.es.js"), "./i18n/bn.json": () => import("./i18n/bn.es.js"), "./i18n/bs.json": () => import("./i18n/bs.es.js"), "./i18n/ca.json": () => import("./i18n/ca.es.js"), "./i18n/cs.json": () => import("./i18n/cs.es.js"), "./i18n/da.json": () => import("./i18n/da.es.js"), "./i18n/de.json": () => import("./i18n/de.es.js"), "./i18n/el.json": () => import("./i18n/el.es.js"), "./i18n/en.json": () => import("./i18n/en.es.js"), "./i18n/es.json": () => import("./i18n/es.es.js"), "./i18n/et.json": () => import("./i18n/et.es.js"), "./i18n/fa.json": () => import("./i18n/fa.es.js"), "./i18n/fr.json": () => import("./i18n/fr.es.js"), "./i18n/he.json": () => import("./i18n/he.es.js"), "./i18n/hr.json": () => import("./i18n/hr.es.js"), "./i18n/hu.json": () => import("./i18n/hu.es.js"), "./i18n/id.json": () => import("./i18n/id.es.js"), "./i18n/is.json": () => import("./i18n/is.es.js"), "./i18n/it.json": () => import("./i18n/it.es.js"), "./i18n/ja.json": () => import("./i18n/ja.es.js"), "./i18n/ka.json": () => import("./i18n/ka.es.js"), "./i18n/ko.json": () => import("./i18n/ko.es.js"), "./i18n/lt.json": () => import("./i18n/lt.es.js"), "./i18n/mn.json": () => import("./i18n/mn.es.js"), "./i18n/nl.json": () => import("./i18n/nl.es.js"), "./i18n/no.json": () => import("./i18n/no.es.js"), "./i18n/pl.json": () => import("./i18n/pl.es.js"), "./i18n/pt-br.json": () => import("./i18n/pt-br.es.js"), "./i18n/ro.json": () => import("./i18n/ro.es.js"), "./i18n/ru.json": () => import("./i18n/ru.es.js"), "./i18n/sk.json": () => import("./i18n/sk.es.js"), "./i18n/sl.json": () => import("./i18n/sl.es.js"), "./i18n/sq.json": () => import("./i18n/sq.es.js"), "./i18n/sr.json": () => import("./i18n/sr.es.js"), "./i18n/sv.json": () => import("./i18n/sv.es.js"), "./i18n/tr.json": () => import("./i18n/tr.es.js"), "./i18n/uk.json": () => import("./i18n/uk.es.js"), "./i18n/vi.json": () => import("./i18n/vi.es.js"), "./i18n/zh-cn.json": () => import("./i18n/zh-cn.es.js"), "./i18n/zh-hk.json": () => import("./i18n/zh-hk.es.js") }), `./i18n/${e}.json`).then((t) => {
      this.texts = Object.assign({}, z, t.default), this.utils.date.updateTexts(this.texts);
    });
}, loadDragAndDrop() {
  import("./drag-and-drop.es.js").then((e) => {
    const { DragAndDrop: t } = e;
    this.modules.dnd = new t(this);
  }).catch(() => console.warn("Vue Cal: Missing drag & drop module."));
}, validateView(e) {
  return ee.includes(e) || (console.error(`Vue Cal: invalid active-view parameter provided: "${e}".
A valid view must be one of: ${ee.join(", ")}.`), e = "week"), this.enabledViews.includes(e) || (console.warn(`Vue Cal: the provided active-view "${e}" is disabled. Using the "${this.enabledViews[0]}" view instead.`), e = this.enabledViews[0]), e;
}, switchToNarrowerView(e = null) {
  this.transitionDirection = "right";
  const t = this.enabledViews[this.enabledViews.indexOf(this.view.id) + 1];
  t && this.switchView(t, e);
}, switchView(e, t = null, i = !1) {
  // переключение между видами календаря
  e = this.validateView(e);
  const n = this.utils.date, l = this.view.startDate && this.view.startDate.getTime();
  if (this.transitions && i) {
    if (this.view.id === e)
      return;
    const a = this.enabledViews;
    this.transitionDirection = a.indexOf(this.view.id) > a.indexOf(e) ? "left" : "right";
  }
  const s = this.view.id;
  switch (this.view.events = [], this.view.id = e, this.view.firstCellDate = null, this.view.lastCellDate = null, t || (t = this.view.selectedDate || this.view.startDate), e) {
    case "years":
      this.view.startDate = new Date(25 * Math.floor(t.getFullYear() / 25) || 2e3, 0, 1), this.view.endDate = new Date(this.view.startDate.getFullYear() + 25, 0, 1), this.view.endDate.setSeconds(-1);
      break;
    case "year":
      this.view.startDate = new Date(t.getFullYear(), 0, 1), this.view.endDate = new Date(t.getFullYear() + 1, 0, 1), this.view.endDate.setSeconds(-1);
      break;
    
    case "month": {
      this.view.startDate = new Date(t.getFullYear(), t.getMonth(), t.getDate() ), 
      this.view.endDate = new Date(t.getFullYear(), t.getMonth(), 1), 
      this.view.endDate.setSeconds(-1);
      let a = new Date(this.view.startDate);
      if (a.getDay() !== (this.startWeekOnSunday ? 0 : 1) && (a = n.getPreviousFirstDayOfWeek(a, this.startWeekOnSunday)), this.view.firstCellDate = a, this.view.lastCellDate = n.addDays(a, 34), this.view.lastCellDate.setHours(23, 59, 59, 0), this.hideWeekends) {
        if ([0, 6].includes(this.view.firstCellDate.getDay())) {
          const d = this.view.firstCellDate.getDay() !== 6 || this.startWeekOnSunday ? 1 : 2;
          this.view.firstCellDate = n.addDays(this.view.firstCellDate, d);
        }
        if ([0, 6].includes(this.view.startDate.getDay())) {
          const d = this.view.startDate.getDay() === 6 ? 2 : 1;
          this.view.startDate = n.addDays(this.view.startDate, d);
        }
        if ([0, 6].includes(this.view.lastCellDate.getDay())) {
          const d = this.view.lastCellDate.getDay() !== 0 || this.startWeekOnSunday ? 1 : 2;
          this.view.lastCellDate = n.subtractDays(this.view.lastCellDate, d);
        }
        if ([0, 6].includes(this.view.endDate.getDay())) {
          const d = this.view.endDate.getDay() === 0 ? 2 : 1;
          this.view.endDate = n.subtractDays(this.view.endDate, d);
        }
      }
      break;
    }
    case "week": {
      t = n.getPreviousFirstDayOfWeek(t, this.startWeekOnSunday);
      const a = this.hideWeekends ? 5 : 7;
      this.view.startDate = this.hideWeekends && this.startWeekOnSunday ? n.addDays(t, 1) : t, this.view.startDate.setHours(0, 0, 0, 0), this.view.endDate = n.addDays(t, a), this.view.endDate.setSeconds(-1);
      break;
    }
    case "day":
      this.view.startDate = t, this.view.startDate.setHours(0, 0, 0, 0), this.view.endDate = new Date(t), this.view.endDate.setHours(23, 59, 59, 0);
  }
  this.addEventsToView();
//   смена вида календаря (день, неделя, месяц, год)
  const o = this.view.startDate && this.view.startDate.getTime();
  if ((s !== e || o !== l) && (this.$emit("update:activeView", e), this.ready)) {
    const a = this.view.startDate, d = { view: e, startDate: a, endDate: this.view.endDate, ...this.isMonthView ? { firstCellDate: this.view.firstCellDate, lastCellDate: this.view.lastCellDate, outOfScopeEvents: this.view.outOfScopeEvents.map(this.cleanupEvent) } : {}, events: this.view.events.map(this.cleanupEvent), ...this.isWeekView ? { week: n.getWeek(this.startWeekOnSunday ? n.addDays(a, 1) : a) } : {} };
    this.$emit("view-change", d);
  }
}, previous() {
  this.previousNext(!1);
}, next() {
  this.previousNext();
}, previousNext(e = !0) {
  const t = this.utils.date;
  this.transitionDirection = e ? "right" : "left";
  const i = e ? 1 : -1;
  let n = null;
  const { startDate: l, id: s } = this.view;
  switch (s) {
    case "years":
      n = new Date(l.getFullYear() + 25 * i, 0, 1);
      break;
    case "year":
      n = new Date(l.getFullYear() + 1 * i, 1, 1);
      break;
      //  переключение вперед/назад
    case "month":
      n = new Date(l.getFullYear(), l.getMonth() + 1 * i, l.getDate());
      break;
    case "week":
      n = t[e ? "addDays" : "subtractDays"](t.getPreviousFirstDayOfWeek(l, this.startWeekOnSunday), 7);
      break;
    case "day":
      n = t[e ? "addDays" : "subtractDays"](l, 1);
      const o = n.getDay(), a = this.startWeekOnSunday ? o : (o || 7) - 1;
      if (this.weekDays[a].hide) {
        const d = this.weekDays.map((u, m) => ({ ...u, i: m }));
        let r = 0;
        e ? ([...d.slice(a), ...d].find((u) => (r++, !u.hide)).i, r--) : [...d, ...d.slice(0, a)].reverse().find((u) => (r++, !u.hide)).i, n = t[e ? "addDays" : "subtractDays"](n, r);
      }
  }
  n && this.switchView(s, n);
}, addEventsToView(e = []) {
  const t = this.utils.event, { startDate: i, endDate: n, firstCellDate: l, lastCellDate: s } = this.view;
  if (e.length || (this.view.events = []), !(e = e.length ? e : [...this.mutableEvents]) || this.isYearsOrYearView && !this.eventsCountOnYearView)
    return;
  let o = e.filter((a) => t.eventInRange(a, i, n));
  this.isYearsOrYearView || this.isMonthView && !this.eventsOnMonthView || (o = o.map((a) => a.daysCount > 1 ? t.createEventSegments(a, l || i, s || n) : a)), this.view.events.push(...o), this.isMonthView && (this.view.outOfScopeEvents = [], e.forEach((a) => {
    (t.eventInRange(a, l, i) || t.eventInRange(a, n, s)) && (this.view.events.some((d) => d._eid === a._eid) || this.view.outOfScopeEvents.push(a));
  }));
}, findAncestor(e, t) {
  for (; (e = e.parentElement) && !e.classList.contains(t); )
    ;
  return e;
}, isDOMElementAnEvent(e) {
  return e.classList.contains("vuecal__event") || this.findAncestor(e, "vuecal__event");
}, onMouseMove(e) {
  const { resizeAnEvent: t, dragAnEvent: i, dragCreateAnEvent: n } = this.domEvents;
  (t._eid !== null || i._eid !== null || n.start) && (e.preventDefault(), t._eid ? this.eventResizing(e) : this.dragToCreateEvent && n.start && this.eventDragCreation(e));
}, onMouseUp(e) {
  const { focusAnEvent: t, resizeAnEvent: i, clickHoldAnEvent: n, clickHoldACell: l, dragCreateAnEvent: s } = this.domEvents, { _eid: o } = n, { _eid: a } = i;
  let d = !1;
  const { event: r, start: u } = s, m = this.isDOMElementAnEvent(e.target), p = t.mousedUp;
  if (t.mousedUp = !1, m && (this.domEvents.cancelClickEventCreation = !0), l.eventCreated)
    return;
  if (a) {
    const { originalEnd: _, originalEndTimeMinutes: x, endTimeMinutes: V } = i, C = this.view.events.find((Y) => Y._eid === i._eid);
    if (d = V && V !== x, C && C.end.getTime() !== _.getTime()) {
      const Y = this.mutableEvents.find((ne) => ne._eid === i._eid);
      Y.endTimeMinutes = C.endTimeMinutes, Y.end = C.end;
      const A = this.cleanupEvent(C), K = { ...this.cleanupEvent(C), end: _, endTimeMinutes: C.originalEndTimeMinutes };
      this.$emit("event-duration-change", { event: A, oldDate: i.originalEnd, originalEvent: K }), this.$emit("event-change", { event: A, originalEvent: K });
    }
    C && (C.resizing = !1), i._eid = null, i.start = null, i.split = null, i.segment = null, i.originalEndTimeMinutes = null, i.originalEnd = null, i.endTimeMinutes = null, i.startCell = null, i.endCell = null;
  } else
    u && (r && (this.emitWithEvent("event-drag-create", r), s.event.resizing = !1), s.start = null, s.split = null, s.event = null);
  m || a || this.unfocusEvent(), n.timeoutId && !o && (clearTimeout(n.timeoutId), n.timeoutId = null), l.timeoutId && (clearTimeout(l.timeoutId), l.timeoutId = null);
  const E = typeof this.onEventClick == "function";
  if (p && !d && !o && !r && E) {
    let _ = this.view.events.find((x) => x._eid === t._eid);
    return !_ && this.isMonthView && (_ = this.view.outOfScopeEvents.find((x) => x._eid === t._eid)), _ && this.onEventClick(_, e);
  }
}, onKeyUp(e) {
  e.keyCode === 27 && this.cancelDelete();
}, eventResizing(e) {
  const { resizeAnEvent: t } = this.domEvents, i = this.view.events.find((r) => r._eid === t._eid) || { segments: {} }, { minutes: n, cursorCoords: l } = this.minutesAtCursor(e), s = i.segments && i.segments[t.segment], { date: o, event: a } = this.utils, d = Math.max(n, this.timeFrom + 1, (s || i).startTimeMinutes + 1);
  if (i.endTimeMinutes = t.endTimeMinutes = d, this.snapToTime) {
    const r = i.endTimeMinutes + this.snapToTime / 2;
    i.endTimeMinutes = r - r % this.snapToTime;
  }
  if (s && (s.endTimeMinutes = i.endTimeMinutes), i.end.setHours(0, i.endTimeMinutes, i.endTimeMinutes === 1440 ? -1 : 0, 0), this.resizeX && this.isWeekView) {
    i.daysCount = o.countDays(i.start, i.end);
    const r = this.cellsEl, u = r.offsetWidth / r.childElementCount, m = Math.floor(l.x / u);
    if (t.startCell === null && (t.startCell = m - (i.daysCount - 1)), t.endCell !== m) {
      t.endCell = m;
      const p = o.addDays(i.start, m - t.startCell), E = Math.max(o.countDays(i.start, p), 1);
      if (E !== i.daysCount) {
        let _ = null;
        _ = E > i.daysCount ? a.addEventSegment(i) : a.removeEventSegment(i), t.segment = _, i.endTimeMinutes += 1e-3;
      }
    }
  }
  this.$emit("event-resizing", { _eid: i._eid, end: i.end, endTimeMinutes: i.endTimeMinutes });
}, eventDragCreation(e) {
  const { dragCreateAnEvent: t } = this.domEvents, { start: i, startCursorY: n, split: l } = t, s = new Date(i), { minutes: o, cursorCoords: { y: a } } = this.minutesAtCursor(e);
  if (t.event || !(Math.abs(n - a) < this.dragToCreateThreshold))
    if (t.event) {
      if (s.setHours(0, o, o === 1440 ? -1 : 0, 0), this.snapToTime) {
        let u = 60 * s.getHours() + s.getMinutes();
        const m = u + this.snapToTime / 2;
        u = m - m % this.snapToTime, s.setHours(0, u, 0, 0);
      }
      const d = i < s, { event: r } = t;
      r.start = d ? i : s, r.end = d ? s : i, r.startTimeMinutes = 60 * r.start.getHours() + r.start.getMinutes(), r.endTimeMinutes = 60 * r.end.getHours() + r.end.getMinutes();
    } else {
      if (t.event = this.utils.event.createAnEvent(i, 1, { split: l }), !t.event)
        return t.start = null, t.split = null, void (t.event = null);
      t.event.resizing = !0;
    }
}, unfocusEvent() {
  const { focusAnEvent: e, clickHoldAnEvent: t } = this.domEvents, i = this.view.events.find((n) => n._eid === (e._eid || t._eid));
  e._eid = null, t._eid = null, i && (i.focused = !1, i.deleting = !1);
}, cancelDelete() {
  const { clickHoldAnEvent: e } = this.domEvents;
  if (e._eid) {
    const t = this.view.events.find((i) => i._eid === e._eid);
    t && (t.deleting = !1), e._eid = null, e.timeoutId = null;
  }
}, onEventTitleBlur(e, t) {
  if (t.title === e.target.innerHTML)
    return;
  const i = t.title;
  t.title = e.target.innerHTML;
  const n = this.cleanupEvent(t);
  this.$emit("event-title-change", { event: n, oldTitle: i }), this.$emit("event-change", { event: n, originalEvent: { ...n, title: i } });
}, updateMutableEvents() {
  const e = this.utils.date;
  this.mutableEvents = [], this.events.forEach((t) => {
    const i = typeof t.start == "string" ? e.stringToDate(t.start) : t.start, n = e.formatDateLite(i), l = e.dateToMinutes(i);
    let s = null;
    typeof t.end == "string" && t.end.includes("24:00") ? (s = new Date(t.end.replace(" 24:00", "")), s.setHours(23, 59, 59, 0)) : s = typeof t.end == "string" ? e.stringToDate(t.end) : t.end;
    let o = e.formatDateLite(s), a = e.dateToMinutes(s);
    a && a !== 1440 || (!this.time || typeof t.end == "string" && t.end.length === 10 ? s.setHours(23, 59, 59, 0) : s.setSeconds(s.getSeconds() - 1), o = e.formatDateLite(s), a = 1440);
    const d = n !== o;
    t = Object.assign({ ...this.utils.event.eventDefaults }, t, { _eid: `${this._.uid}_${this.eventIdIncrement++}`, segments: d ? {} : null, start: i, startTimeMinutes: l, end: s, endTimeMinutes: a, daysCount: d ? e.countDays(i, s) : 1, class: t.class }), this.mutableEvents.push(t);
  });
}, minutesAtCursor(e) {
  return this.utils.cell.minutesAtCursor(e);
}, createEvent(e, t, i = {}) {
  return this.utils.event.createAnEvent(e, t, i);
}, cleanupEvent(e) {
  return e = { ...e }, ["segments", "deletable", "deleting", "titleEditable", "resizable", "resizing", "draggable", "dragging", "draggingStatic", "focused"].forEach((t) => {
    t in e && delete e[t];
  }), e.repeat || delete e.repeat, e;
}, emitWithEvent(e, t) {
  this.$emit(e, this.cleanupEvent(t));
}, updateSelectedDate(e) {
  if ((e = e && typeof e == "string" ? this.utils.date.stringToDate(e) : new Date(e)) && e instanceof Date) {
    const { selectedDate: t } = this.view;
    t && (this.transitionDirection = t.getTime() > e.getTime() ? "left" : "right"), e.setHours(0, 0, 0, 0), t && t.getTime() === e.getTime() || (this.view.selectedDate = e), this.switchView(this.view.id);
  }
  this.$emit("update:selected-date", this.view.selectedDate);
}, getWeekNumber(e) {
  const t = this.utils.date, i = this.firstCellDateWeekNumber + e, n = this.startWeekOnSunday ? 1 : 0;
  return i > 52 ? t.getWeek(t.addDays(this.view.firstCellDate, 7 * e + n)) : i;
}, timeTick() {
  this.now = new Date(), this.timeTickerIds[1] = setTimeout(this.timeTick, 6e4);
}, updateDateTexts() {
  this.utils.date.updateTexts(this.texts);
}, alignWithScrollbar() {
  if (document.getElementById("vuecal-align-with-scrollbar"))
    return;
  const e = this.$refs.vuecal.getElementsByClassName("vuecal__scrollbar-check")[0], t = e.offsetWidth - e.children[0].offsetWidth;
  if (t) {
    const i = document.createElement("style");
    i.id = "vuecal-align-with-scrollbar", i.type = "text/css", i.innerHTML = `.vuecal--view-with-time .vuecal__weekdays-headings,.vuecal--view-with-time .vuecal__all-day {padding-right: ${t}px}`, document.head.appendChild(i);
  }
}, cellOrSplitHasEvents: (e, t = null) => e.length && (!t && e.length || t && e.some((i) => i.split === t.id)) }, created() {
  this.utils.cell = new de(this), this.utils.event = new ue(this, this.utils.date), this.loadLocale(this.locale), this.editEvents.drag && this.loadDragAndDrop(), this.updateMutableEvents(this.events), this.view.id = this.currentView, this.selectedDate ? this.updateSelectedDate(this.selectedDate) : (this.view.selectedDate = new Date(), this.switchView(this.currentView)), this.time && this.watchRealTime && (this.timeTickerIds[0] = setTimeout(this.timeTick, 1e3 * (60 - this.now.getSeconds())));
}, mounted() {
  const e = this.utils.date, t = "ontouchstart" in window, { resize: i, drag: n, create: l, delete: s, title: o } = this.editEvents, a = this.onEventClick && typeof this.onEventClick == "function";
  (i || n || l || s || o || a) && window.addEventListener(t ? "touchend" : "mouseup", this.onMouseUp), (i || n || l && this.dragToCreateEvent) && window.addEventListener(t ? "touchmove" : "mousemove", this.onMouseMove, { passive: !1 }), o && window.addEventListener("keyup", this.onKeyUp), t && (this.$refs.vuecal.oncontextmenu = function(u) {
    u.preventDefault(), u.stopPropagation();
  }), this.hideBody || this.alignWithScrollbar();
  const d = this.view.startDate, r = { view: this.view.id, startDate: d, endDate: this.view.endDate, ...this.isMonthView ? { firstCellDate: this.view.firstCellDate, lastCellDate: this.view.lastCellDate } : {}, events: this.view.events.map(this.cleanupEvent), ...this.isWeekView ? { week: e.getWeek(this.startWeekOnSunday ? e.addDays(d, 1) : d) } : {} };
  this.$emit("ready", r), this.ready = !0;
}, beforeUnmount() {
  const e = "ontouchstart" in window;
  window.removeEventListener(e ? "touchmove" : "mousemove", this.onMouseMove, { passive: !1 }), window.removeEventListener(e ? "touchend" : "mouseup", this.onMouseUp), window.removeEventListener("keyup", this.onKeyUp), this.timeTickerIds[0] && clearTimeout(this.timeTickerIds[0]), this.timeTickerIds[1] && clearTimeout(this.timeTickerIds[1]), this.timeTickerIds = [null, null];
}, computed: { editEvents() {
  return this.editableEvents && typeof this.editableEvents == "object" ? { title: !!this.editableEvents.title, drag: !!this.editableEvents.drag, resize: !!this.editableEvents.resize, create: !!this.editableEvents.create, delete: !!this.editableEvents.delete } : { title: !!this.editableEvents, drag: !!this.editableEvents, resize: !!this.editableEvents, create: !!this.editableEvents, delete: !!this.editableEvents };
}, views() {
  return { years: { label: this.texts.years, enabled: !this.disableViews.includes("years") }, year: { label: this.texts.year, enabled: !this.disableViews.includes("year") }, month: { label: this.texts.month, enabled: !this.disableViews.includes("month") }, week: { label: this.texts.week, enabled: !this.disableViews.includes("week") }, day: { label: this.texts.day, enabled: !this.disableViews.includes("day") } };
}, currentView() {
  return this.validateView(this.activeView);
}, enabledViews() {
  return Object.keys(this.views).filter((e) => this.views[e].enabled);
}, hasTimeColumn() {
  return this.time && this.isWeekOrDayView;
}, isShortMonthView() {
  return this.isMonthView && this.eventsOnMonthView === "short";
}, firstCellDateWeekNumber() {
  const e = this.utils.date, t = this.view.firstCellDate;
  return e.getWeek(this.startWeekOnSunday ? e.addDays(t, 1) : t);
}, timeCells() {
  const e = [];
  for (let t = this.timeFrom, i = this.timeTo; t < i; t += this.timeStep)
    e.push({ hours: Math.floor(t / 60), minutes: t % 60, label: this.utils.date.formatTime(t, this.TimeFormat), value: t });
  return e;
}, TimeFormat() {
  return this.timeFormat || (this.twelveHour ? "h:mm{am}" : "HH:mm");
}, daySplits() {
  return (this.splitDays.filter((e) => !e.hide) || []).map((e, t) => ({ ...e, id: e.id || t + 1 }));
}, hasSplits() {
  return this.daySplits.length && this.isWeekOrDayView;
}, hasShortEvents() {
  return this.showAllDayEvents === "short";
}, cellOrSplitMinWidth() {
  let e = null;
  return this.hasSplits && this.minSplitWidth ? e = this.visibleDaysCount * this.minSplitWidth * this.daySplits.length : this.minCellWidth && this.isWeekView && (e = this.visibleDaysCount * this.minCellWidth), e;
}, allDayBar() {
  let e = this.allDayBarHeight || null;
  return e && !isNaN(e) && (e += "px"), { cells: this.viewCells, options: this.$props, label: this.texts.allDay, shortEvents: this.hasShortEvents, daySplits: this.hasSplits && this.daySplits || [], cellOrSplitMinWidth: this.cellOrSplitMinWidth, height: e };
}, minTimestamp() {
  let e = null;
  return this.minDate && typeof this.minDate == "string" ? e = this.utils.date.stringToDate(this.minDate) : this.minDate && this.minDate instanceof Date && (e = this.minDate), e ? e.getTime() : null;
}, maxTimestamp() {
  let e = null;
  return this.maxDate && typeof this.maxDate == "string" ? e = this.utils.date.stringToDate(this.maxDate) : this.maxDate && this.minDate instanceof Date && (e = this.maxDate), e ? e.getTime() : null;
}, weekDays() {
  let { weekDays: e, weekDaysShort: t = [] } = this.texts;
  return e = e.slice(0).map((i, n) => ({ label: i, ...t.length ? { short: t[n] } : {}, hide: this.hideWeekends && n >= 5 || this.hideWeekdays.length && this.hideWeekdays.includes(n + 1) })), this.startWeekOnSunday && e.unshift(e.pop()), e;
}, weekDaysInHeader() {
  return this.isMonthView || this.isWeekView && !this.minCellWidth && !(this.hasSplits && this.minSplitWidth);
}, months() {
  return this.texts.months.map((e) => ({ label: e }));
}, specialDayHours() {
  return this.specialHours && Object.keys(this.specialHours).length ? Array(7).fill("").map((e, t) => {
    let i = this.specialHours[t + 1] || [];
    return Array.isArray(i) || (i = [i]), e = [], i.forEach(({ from: n, to: l, class: s, label: o }, a) => {
      e[a] = { day: t + 1, from: [null, void 0].includes(n) ? null : 1 * n, to: [null, void 0].includes(l) ? null : 1 * l, class: s || "", label: o || "" };
    }), e;
  }) : {};
}, viewTitle() {
  const e = this.utils.date;
  let t = "";
  const i = this.view.startDate, n = i.getFullYear(), l = i.getMonth();
  switch (this.view.id) {
    case "years":
      t = this.texts.years;
      break;
    case "year":
      t = n;
      break;
    case "month":
      t = `${this.months[l].label} ${n}`;
      break;
    case "week": {
      const s = this.view.endDate, o = i.getFullYear();
      let a = this.texts.months[i.getMonth()];
      this.xsmall && (a = a.substring(0, 3));
      let d = `${a} ${o}`;
      if (s.getMonth() !== i.getMonth()) {
        const r = s.getFullYear();
        let u = this.texts.months[s.getMonth()];
        this.xsmall && (u = u.substring(0, 3)), d = o === r ? `${a} - ${u} ${o}` : this.small ? `${a.substring(0, 3)} ${o} - ${u.substring(0, 3)} ${r}` : `${a} ${o} - ${u} ${r}`;
      }
      t = `${this.texts.week} ${e.getWeek(this.startWeekOnSunday ? e.addDays(i, 1) : i)} (${d})`;
      break;
    }
    case "day":
      t = this.utils.date.formatDate(i, this.texts.dateFormat, this.texts);
  }
  return t;
}, viewCells() {
  const e = this.utils.date;
  let t = [], i = null, n = !1;
  this.watchRealTime || (this.now = new Date());
  const l = this.now;
  switch (this.view.id) {
    case "years":
      i = this.view.startDate.getFullYear(), t = Array.apply(null, Array(25)).map((s, o) => {
        const a = new Date(i + o, 0, 1), d = new Date(i + o + 1, 0, 1);
        return d.setSeconds(-1), { startDate: a, formattedDate: e.formatDateLite(a), endDate: d, content: i + o, current: i + o === l.getFullYear() };
      });
      break;
    case "year":
      i = this.view.startDate.getFullYear(), t = Array.apply(null, Array(12)).map((s, o) => {
        const a = new Date(i, o, 1), d = new Date(i, o + 1, 1);
        return d.setSeconds(-1), { startDate: a, formattedDate: e.formatDateLite(a), endDate: d, content: this.xsmall ? this.months[o].label.substr(0, 3) : this.months[o].label, current: o === l.getMonth() && i === l.getFullYear() };
      });
      break;
      // количество отображаемых ячеек
    case "month": {
      const s = this.view.startDate.getMonth(), o = new Date(this.view.firstCellDate);
      n = !1, 
      
      t = Array.apply(null, Array(35)).map((a, d) => {
        const r = e.addDays(o, d), u = new Date(r);
        u.setHours(23, 59, 59, 0);
        const m = !n && e.isToday(r) && !n++;
        // вне диапазона месяца красит серым true или false
        return { startDate: r, formattedDate: e.formatDateLite(r), endDate: u, content: r.getDate(), today: m, outOfScope: this.maxDate? !(r < this.maxDate && r >= this.minDate.setHours(0, 0, 0, 0)) : false, class: `vuecal__cell--day${r.getDay() || 7}` };
      }), (this.hideWeekends || this.hideWeekdays.length) && (t = t.filter((a) => {
        const d = a.startDate.getDay() || 7;
        return !(this.hideWeekends && d >= 6 || this.hideWeekdays.length && this.hideWeekdays.includes(d));
      }));
      break;
    }
    case "week": {
      n = !1;
      const s = this.view.startDate, o = this.weekDays;
      t = o.map((a, d) => {
        const r = e.addDays(s, this.startWeekOnSunday ? d - 1 : d), u = new Date(r);
        u.setHours(23, 59, 59, 0);
        const m = (r.getDay() || 7) - 1;
        return { startDate: r, formattedDate: e.formatDateLite(r), endDate: u, today: !n && e.isToday(r) && !n++, specialHours: this.specialDayHours[m] || [] };
      }).filter((a, d) => !o[d].hide);
      break;
    }
    case "day": {
      const s = this.view.startDate, o = new Date(this.view.startDate);
      o.setHours(23, 59, 59, 0);
      const a = (s.getDay() || 7) - 1;
      t = [{ startDate: s, formattedDate: e.formatDateLite(s), endDate: o, today: e.isToday(s), specialHours: this.specialDayHours[a] || [] }];
      break;
    }
  }
  return t;
}, visibleDaysCount() {
  return this.isDayView ? 1 : 7 - this.weekDays.reduce((e, t) => e + t.hide, 0);
}, cellWidth() {
  return 100 / this.visibleDaysCount;
}, cssClasses() {
  const { resizeAnEvent: e, dragAnEvent: t, dragCreateAnEvent: i } = this.domEvents;
  return { [`vuecal--${this.view.id}-view`]: !0, [`vuecal--${this.locale}`]: this.locale, "vuecal--no-time": !this.time, "vuecal--view-with-time": this.hasTimeColumn, "vuecal--week-numbers": this.showWeekNumbers && this.isMonthView, "vuecal--twelve-hour": this.twelveHour, "vuecal--click-to-navigate": this.clickToNavigate, "vuecal--hide-weekends": this.hideWeekends, "vuecal--split-days": this.hasSplits, "vuecal--sticky-split-labels": this.hasSplits && this.stickySplitLabels, "vuecal--overflow-x": this.minCellWidth && this.isWeekView || this.hasSplits && this.minSplitWidth, "vuecal--small": this.small, "vuecal--xsmall": this.xsmall, "vuecal--resizing-event": e._eid, "vuecal--drag-creating-event": i.event, "vuecal--dragging-event": t._eid, "vuecal--events-on-month-view": this.eventsOnMonthView, "vuecal--short-events": this.isMonthView && this.eventsOnMonthView === "short", "vuecal--has-touch": typeof window < "u" && "ontouchstart" in window };
}, isYearsOrYearView() {
  return ["years", "year"].includes(this.view.id);
}, isYearsView() {
  return this.view.id === "years";
}, isYearView() {
  return this.view.id === "year";
}, isMonthView() {
  return this.view.id === "month";
}, isWeekOrDayView() {
  return ["week", "day"].includes(this.view.id);
}, isWeekView() {
  return this.view.id === "week";
}, isDayView() {
  return this.view.id === "day";
} }, watch: { events: { handler(e, t) {
  this.updateMutableEvents(e), this.addEventsToView();
}, deep: !0 }, locale(e) {
  this.loadLocale(e);
}, selectedDate(e) {
  this.updateSelectedDate(e);
}, activeView(e) {
  this.switchView(e);
} } }, wt = B(vt, [["render", function(e, t, i, n, l, s) {
  const o = j("vuecal-header"), a = j("all-day-bar"), d = j("weekdays-headings"), r = j("vuecal-cell");
  return h(), c("div", { class: b(["vuecal__flex vuecal", s.cssClasses]), column: "", ref: "vuecal", lang: i.locale }, [P(o, { options: e.$props, "edit-events": s.editEvents, "view-props": { views: s.views, weekDaysInHeader: s.weekDaysInHeader }, "week-days": s.weekDays, "has-splits": s.hasSplits, "day-splits": s.daySplits, "switch-to-narrower-view": s.switchToNarrowerView }, q({ "arrow-prev": g(() => [w(e.$slots, "arrow-prev", {}, () => [M("\xA0"), Le, M("\xA0")])]), "arrow-next": g(() => [w(e.$slots, "arrow-next", {}, () => [M("\xA0"), Fe, M("\xA0")])]), "today-button": g(() => [w(e.$slots, "today-button", {}, () => [k("span", Be, f(l.texts.today), 1)])]), title: g(() => [w(e.$slots, "title", { title: s.viewTitle, view: l.view }, () => [M(f(s.viewTitle), 1)])]), _: 2 }, [e.$slots["weekday-heading"] ? { name: "weekday-heading", fn: g(({ heading: u, view: m }) => [w(e.$slots, "weekday-heading", { heading: u, view: m })]), key: "0" } : void 0, e.$slots["split-label"] ? { name: "split-label", fn: g(({ split: u }) => [w(e.$slots, "split-label", { split: u, view: l.view.id })]), key: "1" } : void 0]), 1032, ["options", "edit-events", "view-props", "week-days", "has-splits", "day-splits", "switch-to-narrower-view"]), i.hideBody ? v("", !0) : (h(), c("div", Ne, [P(U, { name: `slide-fade--${l.transitionDirection}`, appear: i.transitions }, { default: g(() => [(h(), c("div", { class: "vuecal__flex", style: { "min-width": "100%" }, key: !!i.transitions && l.view.id, column: "" }, [i.showAllDayEvents && s.hasTimeColumn && (!s.cellOrSplitMinWidth || s.isDayView && !i.minSplitWidth) ? (h(), H(a, G(Z({ key: 0 }, s.allDayBar)), { event: g(({ event: u, view: m }) => [w(e.$slots, "event", { view: m, event: u }, () => [s.editEvents.title && u.titleEditable ? (h(), c("div", { key: 0, class: "vuecal__event-title vuecal__event-title--edit", contenteditable: "", onBlur: (p) => s.onEventTitleBlur(p, u), innerHTML: u.title }, null, 40, Ie)) : u.title ? (h(), c("div", { key: 1, class: "vuecal__event-title", innerHTML: u.title }, null, 8, ze)) : v("", !0), !u.content || s.hasShortEvents || s.isShortMonthView ? v("", !0) : (h(), c("div", { key: 2, class: "vuecal__event-content", innerHTML: u.content }, null, 8, Pe))])]), _: 3 }, 16)) : v("", !0), k("div", { class: b(["vuecal__bg", { vuecal__flex: !s.hasTimeColumn }]), column: "" }, [k("div", Ue, [s.hasTimeColumn ? (h(), c("div", Re, [i.showAllDayEvents && s.cellOrSplitMinWidth && (!s.isDayView || i.minSplitWidth) ? (h(), c("div", { key: 0, class: "vuecal__all-day-text", style: $({ height: s.allDayBar.height }) }, [k("span", null, f(l.texts.allDay), 1)], 4)) : v("", !0), (h(!0), c(T, null, S(s.timeCells, (u, m) => (h(), c("div", { class: "vuecal__time-cell", key: m, style: $(`height: ${i.timeCellHeight}px`) }, [w(e.$slots, "time-cell", { hours: u.hours, minutes: u.minutes }, () => [qe, k("span", Ke, f(u.label), 1)])], 4))), 128))])) : v("", !0), i.showWeekNumbers && s.isMonthView ? (h(), c("div", Xe, [(h(), c(T, null, S(6, (u) => k("div", { class: "vuecal__flex vuecal__week-number-cell", key: u, grow: "" }, [w(e.$slots, "week-number-cell", { week: s.getWeekNumber(u - 1) }, () => [M(f(s.getWeekNumber(u - 1)), 1)])])), 64))])) : v("", !0), k("div", { class: b(["vuecal__flex vuecal__cells", `${l.view.id}-view`]), grow: "", wrap: !s.cellOrSplitMinWidth || !s.isWeekView, column: !!s.cellOrSplitMinWidth }, [s.cellOrSplitMinWidth && s.isWeekView ? (h(), H(d, { key: 0, "transition-direction": l.transitionDirection, "week-days": s.weekDays, "switch-to-narrower-view": s.switchToNarrowerView, style: $(s.cellOrSplitMinWidth ? `min-width: ${s.cellOrSplitMinWidth}px` : "") }, q({ _: 2 }, [e.$slots["weekday-heading"] ? { name: "weekday-heading", fn: g(({ heading: u, view: m }) => [w(e.$slots, "weekday-heading", { heading: u, view: m })]), key: "0" } : void 0, e.$slots["split-label"] ? { name: "split-label", fn: g(({ split: u }) => [w(e.$slots, "split-label", { split: u, view: l.view.id })]), key: "1" } : void 0]), 1032, ["transition-direction", "week-days", "switch-to-narrower-view", "style"])) : s.hasSplits && i.stickySplitLabels && i.minSplitWidth ? (h(), c("div", { key: 1, class: "vuecal__flex vuecal__split-days-headers", style: $(s.cellOrSplitMinWidth ? `min-width: ${s.cellOrSplitMinWidth}px` : "") }, [(h(!0), c(T, null, S(s.daySplits, (u, m) => (h(), c("div", { class: b(["day-split-header", u.class || !1]), key: m }, [w(e.$slots, "split-label", { split: u, view: l.view.id }, () => [M(f(u.label), 1)])], 2))), 128))], 4)) : v("", !0), i.showAllDayEvents && s.hasTimeColumn && (s.isWeekView && s.cellOrSplitMinWidth || s.isDayView && s.hasSplits && i.minSplitWidth) ? (h(), H(a, G(Z({ key: 2 }, s.allDayBar)), { event: g(({ event: u, view: m }) => [w(e.$slots, "event", { view: m, event: u }, () => [s.editEvents.title && u.titleEditable ? (h(), c("div", { key: 0, class: "vuecal__event-title vuecal__event-title--edit", contenteditable: "", onBlur: (p) => s.onEventTitleBlur(p, u), innerHTML: u.title }, null, 40, Ze)) : u.title ? (h(), c("div", { key: 1, class: "vuecal__event-title", innerHTML: u.title }, null, 8, Je)) : v("", !0), !u.content || s.hasShortEvents || s.isShortMonthView ? v("", !0) : (h(), c("div", { key: 2, class: "vuecal__event-content", innerHTML: u.content }, null, 8, Qe))])]), _: 3 }, 16)) : v("", !0), k("div", { class: "vuecal__flex", ref: (u) => l.cellsEl = u, grow: "", wrap: !s.cellOrSplitMinWidth || !s.isWeekView, style: $(s.cellOrSplitMinWidth ? `min-width: ${s.cellOrSplitMinWidth}px` : "") }, [(h(!0), c(T, null, S(s.viewCells, (u, m) => (h(), H(r, { key: m, options: e.$props, "edit-events": s.editEvents, data: u, "cell-width": i.hideWeekdays.length && (s.isWeekView || s.isMonthView) && s.cellWidth, "min-timestamp": s.minTimestamp, "max-timestamp": s.maxTimestamp, "cell-splits": s.hasSplits && s.daySplits || [] }, { "cell-content": g(({ events: p, split: E, selectCell: _ }) => [w(e.$slots, "cell-content", { cell: u, view: l.view, goNarrower: _, events: p }, () => [E && !i.stickySplitLabels ? (h(), c("div", { key: 0, class: "split-label", innerHTML: E.label }, null, 8, tt)) : v("", !0), u.content ? (h(), c("div", { key: 1, class: "vuecal__cell-date", innerHTML: u.content }, null, 8, it)) : v("", !0), (s.isMonthView && !i.eventsOnMonthView || s.isYearsOrYearView && i.eventsCountOnYearView) && p.length ? (h(), c("div", st, [w(e.$slots, "events-count", { view: l.view, events: p }, () => [M(f(p.length), 1)])])) : v("", !0), !s.cellOrSplitHasEvents(p, E) && s.isWeekOrDayView ? (h(), c("div", nt, [w(e.$slots, "no-event", {}, () => [M(f(l.texts.noEvent), 1)])])) : v("", !0)])]), event: g(({ event: p, view: E }) => [w(e.$slots, "event", { view: E, event: p }, () => [s.editEvents.title && p.titleEditable ? (h(), c("div", { key: 0, class: "vuecal__event-title vuecal__event-title--edit", contenteditable: "", onBlur: (_) => s.onEventTitleBlur(_, p), innerHTML: p.title }, null, 40, at)) : p.title ? (h(), c("div", { key: 1, class: "vuecal__event-title", innerHTML: p.title }, null, 8, lt)) : v("", !0), !i.time || p.allDay || s.isMonthView && (p.allDay || i.showAllDayEvents === "short") || s.isShortMonthView ? v("", !0) : (h(), c("div", ot, [M(f(l.utils.date.formatTime(p.start, s.TimeFormat)), 1), p.endTimeMinutes ? (h(), c("span", rt, "\xA0- " + f(l.utils.date.formatTime(p.end, s.TimeFormat, null, !0)), 1)) : v("", !0), p.daysCount > 1 && (p.segments[u.formattedDate] || {}).isFirstDay ? (h(), c("small", dt, "\xA0+" + f(p.daysCount - 1) + f((l.texts.day[0] || "").toLowerCase()), 1)) : v("", !0)])), !p.content || s.isMonthView && p.allDay && i.showAllDayEvents === "short" || s.isShortMonthView ? v("", !0) : (h(), c("div", { key: 3, class: "vuecal__event-content", innerHTML: p.content }, null, 8, ut))])]), "no-event": g(() => [w(e.$slots, "no-event", {}, () => [M(f(l.texts.noEvent), 1)])]), _: 2 }, 1032, ["options", "edit-events", "data", "cell-width", "min-timestamp", "max-timestamp", "cell-splits"]))), 128))], 12, et)], 10, Ge)])], 2)]))]), _: 3 }, 8, ["name", "appear"]), l.ready ? v("", !0) : (h(), c("div", ht, ct))]))], 10, Ye);
}]]);
export {
  wt as default
};
