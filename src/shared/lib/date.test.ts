import { formatDate } from './date';

describe('date.ts', () => {
  describe('formatDate', () => {
    test('форматирует дату с днём, месяцем, часами и минутами', () => {
      const date = new Date('2024-03-15T14:30:00');
      const result = formatDate(date);

      expect(result).toContain('15');
      expect(result).toContain('марта');
      expect(result).toContain('14');
      expect(result).toContain('30');
    });

    test('форматирует дату с ведущим нулём для минут', () => {
      const date = new Date('2024-06-20T08:05:00');
      const result = formatDate(date);

      expect(result).toContain('08');
      expect(result).toContain('05');
    });

    test('использует русскую локаль', () => {
      const date = new Date('2024-01-01T12:00:00');
      const result = formatDate(date);

      expect(result).toContain('января');
    });

    test('работает с разными месяцами', () => {
      const testCases = [
        { date: new Date('2024-01-15T10:00:00'), expectedMonth: 'января' },
        {
          date: new Date('2024-02-15T10:00:00'),
          expectedMonth: 'февраля',
        },
        { date: new Date('2024-03-15T10:00:00'), expectedMonth: 'марта' },
        { date: new Date('2024-04-15T10:00:00'), expectedMonth: 'апреля' },
        { date: new Date('2024-05-15T10:00:00'), expectedMonth: 'мая' },
        { date: new Date('2024-06-15T10:00:00'), expectedMonth: 'июня' },
        { date: new Date('2024-07-15T10:00:00'), expectedMonth: 'июля' },
        {
          date: new Date('2024-08-15T10:00:00'),
          expectedMonth: 'августа',
        },
        {
          date: new Date('2024-09-15T10:00:00'),
          expectedMonth: 'сентября',
        },
        {
          date: new Date('2024-10-15T10:00:00'),
          expectedMonth: 'октября',
        },
        { date: new Date('2024-11-15T10:00:00'), expectedMonth: 'ноября' },
        {
          date: new Date('2024-12-15T10:00:00'),
          expectedMonth: 'декабря',
        },
      ];

      testCases.forEach(({ date, expectedMonth }) => {
        expect(formatDate(date)).toContain(expectedMonth);
      });
    });
  });
});
