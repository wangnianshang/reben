import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NoteInput from '../NoteInput';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    section: ({ children, ...props }: any) => React.createElement('section', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    img: ({ children, ...props }: any) => React.createElement('img', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, {}, children),
}));

describe('NoteInput Component', () => {
  const mockOnSave = vi.fn();

  it('renders correctly', () => {
    render(<NoteInput onSave={mockOnSave} />);
    expect(screen.getByPlaceholderText('记录今天的学习收获...')).toBeInTheDocument();
    expect(screen.getByText('记录新知识')).toBeInTheDocument();
  });

  it('disables save button when empty', () => {
    render(<NoteInput onSave={mockOnSave} />);
    const saveBtn = screen.getByText('保存笔记');
    expect(saveBtn).toBeDisabled();
  });

  it('enables save button when text is entered', () => {
    render(<NoteInput onSave={mockOnSave} />);
    const textarea = screen.getByPlaceholderText('记录今天的学习收获...');
    fireEvent.change(textarea, { target: { value: 'Test Note' } });
    
    const saveBtn = screen.getByText('保存笔记');
    expect(saveBtn).not.toBeDisabled();
    
    fireEvent.click(saveBtn);
    expect(mockOnSave).toHaveBeenCalledWith('Test Note', null, '');
  });

  // Simple test for drag drop visual feedback simulation (if needed)
  // But verifying state change via class name is easier
  it('shows drag over state', () => {
    const { container } = render(<NoteInput onSave={mockOnSave} />);
    const dropArea = container.querySelector('.image-upload-area');
    
    if (dropArea) {
        fireEvent.dragOver(dropArea);
        expect(dropArea.className).toContain('drag-over');
        
        fireEvent.dragLeave(dropArea);
        expect(dropArea.className).not.toContain('drag-over');
    }
  });
});
