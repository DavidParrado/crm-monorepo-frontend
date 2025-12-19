import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatChatTime = (date: string): string => {
  return format(new Date(date), 'HH:mm', { locale: es });
};

export const formatChatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: es });
  }
  
  if (isYesterday(date)) {
    return 'Ayer';
  }
  
  return format(date, 'dd/MM/yy', { locale: es });
};
