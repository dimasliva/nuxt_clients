export function formatPhoneNumber(phoneNumber: string) {
    const str = String(phoneNumber);
  
    if (str.length === 11 && str.startsWith('7')) {
      return `+${str[0]} ${str.slice(1, 4)} ${str.slice(4, 7)}-${str.slice(7, 9)}-${str.slice(9)}`;
    }
  
    return phoneNumber;
  }
  export function formatDateToddMMyyyy(value: string) {
    if(!value) {
        return ""
    }
    const values = value.split('.');
    console.log('values', values)
    if(values.length > 0) {
      return value
    }
    const date = new Date(value);

    
    const formattedDate = new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
    
    return formattedDate    
  }
