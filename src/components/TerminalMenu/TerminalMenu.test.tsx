/**
 * TerminalMenu Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TerminalMenu } from './TerminalMenu';

describe('TerminalMenu', () => {
  const mockItems = [
    { id: '1', label: 'Item 1', value: 'item1' },
    { id: '2', label: 'Item 2', value: 'item2' },
    { id: '3', label: 'Item 3', value: 'item3' },
  ];

  describe('Rendering', () => {
    it('should render trigger button', () => {
      render(<TerminalMenu items={mockItems} trigger="Open Menu" />);
      expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    });

    it('should not show menu items initially', () => {
      render(<TerminalMenu items={mockItems} trigger="Menu" />);
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TerminalMenu items={mockItems} trigger="Menu" className="custom-class" />
      );
      expect(container.querySelector('.terminal-menu')).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('should open menu when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<TerminalMenu items={mockItems} trigger="Menu" />);

      await user.click(screen.getByRole('button', { name: /menu/i }));

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <TerminalMenu items={mockItems} trigger="Menu" />
          <div data-testid="outside">Outside</div>
        </div>
      );

      await user.click(screen.getByRole('button', { name: /menu/i }));
      expect(screen.getByText('Item 1')).toBeInTheDocument();

      // Click outside - use mousedown since that's what the component listens for
      const outsideElement = screen.getByTestId('outside');
      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
      outsideElement.dispatchEvent(mouseDownEvent);

      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });

    it('should call onSelect when item is clicked', async () => {
      const handleSelect = jest.fn();
      const user = userEvent.setup();

      render(
        <TerminalMenu items={mockItems} trigger="Menu" onSelect={handleSelect} />
      );

      await user.click(screen.getByRole('button', { name: /menu/i }));
      await user.click(screen.getByText('Item 2'));

      expect(handleSelect).toHaveBeenCalledWith(mockItems[1]);
    });

    it('should close menu after selecting item', async () => {
      const user = userEvent.setup();
      render(<TerminalMenu items={mockItems} trigger="Menu" />);

      await user.click(screen.getByRole('button', { name: /menu/i }));
      await user.click(screen.getByText('Item 1'));

      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });

    it('should not select disabled items', async () => {
      const handleSelect = jest.fn();
      const user = userEvent.setup();
      const itemsWithDisabled = [
        { id: '1', label: 'Item 1', value: 'item1' },
        { id: '2', label: 'Item 2', value: 'item2', disabled: true },
      ];

      render(
        <TerminalMenu
          items={itemsWithDisabled}
          trigger="Menu"
          onSelect={handleSelect}
        />
      );

      await user.click(screen.getByRole('button', { name: /menu/i }));
      await user.click(screen.getByText('Item 2'));

      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open menu with Enter key', async () => {
      const user = userEvent.setup();
      render(<TerminalMenu items={mockItems} trigger="Menu" />);

      const trigger = screen.getByRole('button', { name: /menu/i });
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('should close menu with Escape key', async () => {
      const user = userEvent.setup();
      render(<TerminalMenu items={mockItems} trigger="Menu" />);

      await user.click(screen.getByRole('button', { name: /menu/i }));
      expect(screen.getByText('Item 1')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });

    it('should navigate items with arrow keys', async () => {
      const user = userEvent.setup();
      render(<TerminalMenu items={mockItems} trigger="Menu" />);

      await user.click(screen.getByRole('button', { name: /menu/i }));

      // Arrow down should highlight first item
      await user.keyboard('{ArrowDown}');
      const firstItem = screen.getByText('Item 1').closest('.terminal-menu__item');
      expect(firstItem).toHaveClass('terminal-menu__item--highlighted');

      // Arrow down again should highlight second item
      await user.keyboard('{ArrowDown}');
      const secondItem = screen.getByText('Item 2').closest('.terminal-menu__item');
      expect(secondItem).toHaveClass('terminal-menu__item--highlighted');
    });

    it('should select item with Enter key', async () => {
      const handleSelect = jest.fn();
      const user = userEvent.setup();

      render(
        <TerminalMenu items={mockItems} trigger="Menu" onSelect={handleSelect} />
      );

      await user.click(screen.getByRole('button', { name: /menu/i }));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(handleSelect).toHaveBeenCalledWith(mockItems[0]);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on trigger', () => {
      render(<TerminalMenu items={mockItems} trigger="Menu" />);
      const trigger = screen.getByRole('button', { name: /menu/i });

      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when menu is open', async () => {
      const user = userEvent.setup();
      render(<TerminalMenu items={mockItems} trigger="Menu" />);
      const trigger = screen.getByRole('button', { name: /menu/i });

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have role="menu" on menu container', async () => {
      const user = userEvent.setup();
      render(<TerminalMenu items={mockItems} trigger="Menu" />);

      await user.click(screen.getByRole('button', { name: /menu/i }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should have role="menuitem" on items', async () => {
      const user = userEvent.setup();
      render(<TerminalMenu items={mockItems} trigger="Menu" />);

      await user.click(screen.getByRole('button', { name: /menu/i }));
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(3);
    });
  });

  describe('Item Separators', () => {
    it('should render separator items', async () => {
      const user = userEvent.setup();
      const itemsWithSeparator = [
        { id: '1', label: 'Item 1', value: 'item1' },
        { id: 'sep', separator: true },
        { id: '2', label: 'Item 2', value: 'item2' },
      ];

      const { container } = render(
        <TerminalMenu items={itemsWithSeparator} trigger="Menu" />
      );
      await user.click(screen.getByRole('button', { name: /menu/i }));

      const separator = container.querySelector('.terminal-menu__separator');
      expect(separator).toBeInTheDocument();
    });
  });
});
