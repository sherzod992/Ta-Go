import React from 'react';
import FAQItem, { FaqItemData } from './FAQItem';
import { Stack } from '@mui/material';

interface FAQListProps {
  items?: FaqItemData[];
  limit?: number;
}

const mockFaqs: FaqItemData[] = [
  { id: '1', question: '회원가입은 어떻게 하나요?', answer: '상단의 로그인 페이지에서 회원가입을 진행할 수 있습니다.' },
  { id: '2', question: '비밀번호를 잊어버렸어요.', answer: '로그인 페이지에서 비밀번호 찾기를 이용하세요.' },
  { id: '3', question: '문의는 어디서 하나요?', answer: 'CS 페이지의 1:1 문의하기를 이용해주세요.' },
  { id: '4', question: '매물 등록은 어떻게 하나요?', answer: '로그인 후 판매하기 메뉴에서 등록 가능합니다.' },
  { id: '5', question: '언어 설정은 어디서 바꾸나요?', answer: '상단 우측 언어 선택 메뉴에서 변경할 수 있습니다.' },
  { id: '6', question: '가격 비교 기능이 있나요?', answer: 'Property Compare 페이지에서 이용 가능합니다.' },
];

const FAQList: React.FC<FAQListProps> = ({ items = mockFaqs, limit }) => {
  const data = typeof limit === 'number' ? items.slice(0, limit) : items;
  return (
    <Stack spacing={1}>
      {data.map((item, idx) => (
        <FAQItem key={item.id} item={item} defaultExpanded={idx === 0} />
      ))}
    </Stack>
  );
};

export default FAQList;


