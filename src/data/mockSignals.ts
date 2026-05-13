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
  sender: 'Mina',
  senderNo: '04',
  time: '14:56',
  note: '2 sec Blink',
  hasBlink: true,
  status: 'new',
};

export const signalQueue: Signal[] = [
  { id: 's-486', code: '486', sender: 'Joon', senderNo: '07', time: '14:32', status: 'new' },
  { id: 's-000', code: '000', sender: 'Sol', senderNo: '09', time: '13:11', status: 'read' },
  { id: 's-1004', code: '1004', sender: 'Yuna', senderNo: '11', time: '09:41', status: 'read' },
];

export const friends: Friend[] = [
  { id: 'f-04', no: '04', name: 'Mina', relation: 'close friend', presets: ['OK', '8282', '486'], isClose: true },
  { id: 'f-07', no: '07', name: 'Joon', relation: 'best', presets: ['486', '000'] },
  { id: 'f-11', no: '11', name: 'Yuna', relation: 'roommate', presets: ['1004', '8282'] },
];

export const logs: Signal[] = [
  { id: 'l-8282', code: '8282', sender: 'Mina', senderNo: '04', time: '14:56', status: 'saved', hasBlink: true, note: 'Blink saved' },
  { id: 'l-486', code: '486', sender: 'Joon', senderNo: '07', time: 'Yesterday', status: 'saved', note: 'Beep saved' },
  { id: 'l-000', code: '000', sender: 'Sol', senderNo: '09', time: 'Apr 28', status: 'expired', hasBlink: true, note: 'Blink expired' },
  { id: 'l-1004', code: '1004', sender: 'Yuna', senderNo: '11', time: 'Apr 25', status: 'saved', note: 'Saved' },
];
