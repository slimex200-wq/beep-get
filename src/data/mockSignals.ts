export type Signal = {
  id: string;
  code: string;
  sender: string;
  senderNo: string;
  time: string;
  note?: string;
  hasBlink?: boolean;
  status?: 'new' | 'read' | 'saved' | 'expired';
};

export type Friend = {
  id: string;
  no: string;
  name: string;
  relation: string;
  presets: string[];
  isClose?: boolean;
};

export const latestSignal: Signal = {
  id: 's-8282',
  code: '8282',
  sender: '민아',
  senderNo: '04',
  time: '14:56',
  note: '2초 Blink 있음',
  hasBlink: true,
  status: 'new',
};

export const signalQueue: Signal[] = [
  { id: 's-486', code: '486', sender: '준호', senderNo: '07', time: '14:32', status: 'new' },
  { id: 's-000', code: '000', sender: '솔', senderNo: '09', time: '13:11', status: 'read' },
  { id: 's-1004', code: '1004', sender: '유나', senderNo: '11', time: '09:41', status: 'read' },
];

export const friends: Friend[] = [
  { id: 'f-04', no: '04', name: '민아', relation: '가까운 친구', presets: ['OK', '8282', '486'], isClose: true },
  { id: 'f-07', no: '07', name: '준호', relation: '베스트', presets: ['486', '000'] },
  { id: 'f-11', no: '11', name: '유나', relation: '소울메이트', presets: ['1004', '8282'] },
];

export const logs: Signal[] = [
  { id: 'l-8282', code: '8282', sender: '민아', senderNo: '04', time: '14:56', status: 'saved', hasBlink: true, note: 'Blink 저장됨' },
  { id: 'l-486', code: '486', sender: '준호', senderNo: '07', time: '어제', status: 'saved', note: 'Beep 저장됨' },
  { id: 'l-000', code: '000', sender: '솔', senderNo: '09', time: '4월 28일', status: 'expired', hasBlink: true, note: 'Blink 만료됨' },
  { id: 'l-1004', code: '1004', sender: '유나', senderNo: '11', time: '4월 25일', status: 'saved', note: '저장됨' },
];
