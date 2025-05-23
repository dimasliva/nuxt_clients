export class ScheduleEvent {
  /**Начало события, если вид месяц то формат "YYYY-MM-DD", если виды неделя и день, то формат "YYYY-MM-DD HH:mm"*/
  start: string | any = "";
  /** Конец события, если вид месяц то формат "YYYY-MM-DD", если виды неделя и день, то формат "YYYY-MM-DD HH:mm"*/
  end: string | any = "";
  /**Список услуг для отображения в виде на месяц*/
  products: { id: string; title: string; quantity: number; duration: number; time: string }[] | string[] = [];
  /** Если вид месяц, то значения "Утро, День, Вечер"*/
  title: string;
  /**Время начала временного интервала*/
  startTime: number;
  /**Время конца временного интервала*/
  endTime: number;
  /**Сотрудник и его данные*/
  employee?: {id: string, name: string, surname: string, patronymic?: string, position: string};
  /**Клиент и его данные*/
  client?: {id: string, name: string, surname: string, patronymic?: string, phone: string};
  /**Размещение доп контента, например иконки*/
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
  /**ID получаемое из API*/
  id?: string;

  duration?: number;

  constructor(start, end, products, title, startTime, endTime, clss?, content?, background?, split?, allDay?, deletable?, resizable?, id?, duration?) {
    this.start = start;
    this.end = end;
    this.products = products;
    this.title = title;
    this.class = clss;
    this.startTime = startTime;
    this.endTime = endTime;
    this.content = content;
    this.background = background;
    this.split = split;
    this.allDay = allDay;
    this.deletable = deletable;
    this.resizable = resizable;
    this.id = id;
    this.duration = duration;
  }
}
