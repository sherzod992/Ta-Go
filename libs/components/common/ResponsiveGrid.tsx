import React from 'react';
import { Box, Grid, GridProps } from '@mui/material';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveGridProps extends Omit<GridProps, 'container'> {
  children: React.ReactNode;
  spacing?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  autoFit?: boolean;
  autoFill?: boolean;
  minItemWidth?: number | string;
  maxItemWidth?: number | string;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 2,
  columns,
  gap,
  autoFit = false,
  autoFill = false,
  minItemWidth = 250,
  maxItemWidth,
  sx,
  ...gridProps
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // 반응형 spacing 계산
  const getSpacing = () => {
    if (typeof spacing === 'object') {
      return {
        xs: spacing.xs || 1,
        sm: spacing.sm || spacing.xs || 1.5,
        md: spacing.md || spacing.sm || spacing.xs || 2,
        lg: spacing.lg || spacing.md || spacing.sm || spacing.xs || 2,
        xl: spacing.xl || spacing.lg || spacing.md || spacing.sm || spacing.xs || 2,
      };
    }
    return spacing;
  };

  // 반응형 columns 계산
  const getColumns = () => {
    if (typeof columns === 'object') {
      return {
        xs: columns.xs || 1,
        sm: columns.sm || columns.xs || 2,
        md: columns.md || columns.sm || columns.xs || 3,
        lg: columns.lg || columns.md || columns.sm || columns.xs || 4,
        xl: columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 5,
      };
    }
    
    if (typeof columns === 'number') {
      return {
        xs: Math.min(columns, 1),
        sm: Math.min(columns, 2),
        md: Math.min(columns, 3),
        lg: Math.min(columns, 4),
        xl: columns,
      };
    }

    // 기본값
    return {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    };
  };

  // CSS Grid를 사용한 자동 배치
  if (autoFit || autoFill) {
    const gridTemplateColumns = autoFit 
      ? `repeat(auto-fit, minmax(${minItemWidth}px, ${maxItemWidth || '1fr'}))`
      : `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`;

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns,
          gap: getSpacing(),
          ...sx,
        }}
        {...gridProps}
      >
        {children}
      </Box>
    );
  }

  // Material-UI Grid를 사용한 반응형 배치
  const columnConfig = getColumns();
  const spacingConfig = getSpacing();

  return (
    <Grid
      container
      spacing={spacingConfig}
      sx={{
        ...sx,
      }}
      {...gridProps}
    >
      {React.Children.map(children, (child) => (
        <Grid
          item
          xs={12 / columnConfig.xs}
          sm={12 / columnConfig.sm}
          md={12 / columnConfig.md}
          lg={12 / columnConfig.lg}
          xl={12 / columnConfig.xl}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

// 특정 용도별 그리드 컴포넌트들
export const CardGrid: React.FC<Omit<ResponsiveGridProps, 'autoFit' | 'autoFill'>> = (props) => (
  <ResponsiveGrid
    columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
    spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3 }}
    {...props}
  />
);

export const ProductGrid: React.FC<Omit<ResponsiveGridProps, 'autoFit' | 'autoFill'>> = (props) => (
  <ResponsiveGrid
    columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }}
    spacing={{ xs: 1, sm: 1.5, md: 2, lg: 2.5 }}
    {...props}
  />
);

export const AutoFitGrid: React.FC<Omit<ResponsiveGridProps, 'columns'>> = (props) => (
  <ResponsiveGrid
    autoFit
    minItemWidth={250}
    spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3 }}
    {...props}
  />
);

export const MasonryGrid: React.FC<Omit<ResponsiveGridProps, 'autoFit' | 'autoFill'>> = (props) => (
  <ResponsiveGrid
    autoFit
    minItemWidth={300}
    spacing={{ xs: 1, sm: 1.5, md: 2 }}
    {...props}
  />
);

export default ResponsiveGrid;
