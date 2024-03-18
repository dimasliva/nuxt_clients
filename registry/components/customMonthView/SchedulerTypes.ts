export class ScheduleEvent {
  /**Начало события, если вид месяц то формат "ГГГГ-ММ-ДД", если виды неделя и день, то формат "ГГГГ-ММ-ДД ЧЧ:ММ"*/
  start: string | any = "";
  /** Конец события, если вид месяц то формат "ГГГГ-ММ-ДД", если виды неделя и день, то формат "ГГГГ-ММ-ДД ЧЧ:ММ"*/
  end: string = "";
  /** */
  products: { id: string; title: string; quantity: number }[] = [];
  /** Если вид месяц, то значения "Утро, День, Вечер"*/
  title: string;
  /**Размещение доп конетнта, например иконки*/
  content?: string;
  /**Стилизация событий, для добавления статусов*/
  class?: string;
  /**Делает событие "фоновым", можно перекрывать другими событиями, при этом отключает возможность изменения размера и удаления события (не имеет ничего общего с CSS-свойством background)*/
  background?: boolean;
  /**Если есть параметр split в компоненте расписания, устанавливает к какому "сплиту" относится данное событие*/
  split?: number | string;
  /**Событие на весь день */
  allDay?: boolean;
  /**Если есть параметр editable в компоненте расписания, делает событие удаляемым/не удаляемым */
  deletable?: boolean;
  /**Если есть параметр editable в компоненте расписания, делает событие изменяемым по размеру/не изменяемым по размеру */
  resizable?: boolean;

  constructor(start, end, products, title, clss?, content?, background?, split?, allDay?, deletable?, resizable?) {
    this.start = start;
    this.end = end;
    this.products = products;
    this.title = title;
    this.class = clss;
    this.content = content;
    this.background = background;
    this.split = split;
    this.allDay = allDay;
    this.deletable = deletable;
    this.resizable = resizable;
  }
}
