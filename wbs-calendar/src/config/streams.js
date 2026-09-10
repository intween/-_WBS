export const STREAMS = [
  { id: 'a', name: '프로그램 기획' },
  { id: 'b', name: '기업 진단 컨설팅' },
  { id: 'c', name: '현지 섭외 대관' },
  { id: 'd', name: '디자인 홍보' },
  { id: 'e', name: 'IR 고도화' },
  { id: 'f', name: '운영 준비 물품' },
  { id: 'g', name: '현지 일정' },
];

export const STREAM_MAP = STREAMS.reduce((acc, stream) => {
  acc[stream.id] = stream;
  return acc;
}, {});
