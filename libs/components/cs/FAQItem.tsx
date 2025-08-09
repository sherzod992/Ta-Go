import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

interface FAQItemProps {
  item: FaqItemData;
  defaultExpanded?: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({ item, defaultExpanded }) => {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 600 }}>{item.question}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{item.answer}</Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default FAQItem;


