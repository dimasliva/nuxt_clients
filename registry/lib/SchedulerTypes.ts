export class ScheduleEvent {
  start: string = ""; // Начало события, если вид месяц то формат "ГГГГ-ММ-ДД", если виды неделя и день, то формат "ГГГГ-ММ-ДД ЧЧ:ММ"
  end: string = ""; // Конец события, если вид месяц то формат "ГГГГ-ММ-ДД", если виды неделя и день, то формат "ГГГГ-ММ-ДД ЧЧ:ММ"
  title?: string; // Не желательно оставлять это поле пустым, если вид месяц, то значения "Утро, День, Вечер"
  content?: string; // Размещение доп конетнта, например иконки
  class?: string; // Стилизация событий, для добавления статусов
  background?: boolean; // Делает событие "фоновым", можно перекрывать другими событиями, при этом отключает возможность изменения размера и удаления события (не имеет ничего общего с CSS-свойством background)
  split?: number | string; // Если есть параметр split в компоненте расписания, устанавливает к какому "сплиту" относится данное событие
  allDay?: boolean; // Событие на весь день
  deletable?: boolean; // Если есть параметр editable в компоненте расписания, делает событие удаляемым/не удаляемым
  resizable?: boolean; // Если есть параметр editable в компоненте расписания, делает событие изменяемым по размеру/не изменяемым по размеру

  constructor(start, end, title?, content?, clss?, background?, split?, allDay?, deletable?, resizable?) {
    this.start = start;
    this.end = end;
    this.title = title;
    this.content = content;
    this.class = clss;
    this.background = background;
    this.split = split;
    this.allDay = allDay;
    this.deletable = deletable;
    this.resizable = resizable;
  }
}
