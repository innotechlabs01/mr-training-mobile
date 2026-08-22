import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassDock, GlassDockIndicatorProto } from '../GlassDock';

function makeProps(active: string, nav?: { navigate?: jest.Mock }): BottomTabBarProps {
  const routes = [
    { key: 'Today', name: 'Today' },
    { key: 'Plan', name: 'Plan' },
    { key: 'Events', name: 'Events' },
    { key: 'Profile', name: 'Profile' },
  ];
  return {
    state: { index: routes.findIndex((r) => r.name === active), routes, key: 'tab', routeNames: ['Today', 'Plan', 'Events', 'Profile'], stale: false, type: 'tab', history: [], preloadedRouteKeys: [] },
    descriptors: Object.fromEntries(
      routes.map((r) => [r.key, { options: { tabBarLabel: { Today: 'Hoy', Plan: 'Plan', Events: 'Eventos', Profile: 'Perfil' }[r.name] } }]),
    ) as BottomTabBarProps['descriptors'],
    navigation: { emit: jest.fn(() => ({ defaultPrevented: false }) as any), navigate: nav?.navigate ?? jest.fn() } as unknown as BottomTabBarProps['navigation'],
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  };
}

describe('GlassDock', () => {
  it('renders the four tab labels and marks the active tab', () => {
    const { getByRole } = render(<GlassDock {...makeProps('Today')} />);
    expect(getByRole('tab', { name: 'Hoy' })).toBeTruthy();
    expect(getByRole('tab', { name: 'Plan' })).toBeTruthy();
    expect(getByRole('tab', { name: 'Eventos' })).toBeTruthy();
    expect(getByRole('tab', { name: 'Perfil' })).toBeTruthy();
    expect(getByRole('tab', { name: 'Hoy' }).props.accessibilityState.selected).toBe(true);
  });

  it('navigates to a non-active tab on press', () => {
    const navigate = jest.fn();
    const { getByRole } = render(<GlassDock {...makeProps('Today', { navigate })} />);
    fireEvent.press(getByRole('tab', { name: 'Plan' }));
    expect(navigate).toHaveBeenCalledWith('Plan');
  });

  it('marks exactly one tab focused and all four dots render', () => {
    const { UNSAFE_getAllByType } = render(<GlassDock {...makeProps('Events')} />);
    const all = UNSAFE_getAllByType(GlassDockIndicatorProto);
    expect(all.length).toBe(4);
    expect(all.filter((n: any) => n.props.focused).length).toBe(1);
  });
});
