"use client";

import styled from "styled-components";

export const HorizontalScrollList = styled.div`
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 6px 16px 12px;
  margin: 0 -16px;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const HorizontalScrollItem = styled.div`
  flex: 0 0 auto;
  scroll-snap-align: start;
`;
