import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from '../Tasks';
import { Task } from '../../types';

describe('TaskCard Component', () => {
  const mockTask: Task = {
    _id: '1',
    title: 'Complete the backend API',
    description: 'Implement Node.js controllers and routes',
    status: 'In Progress',
    priority: 'High',
    // user: 'user123',
    // createdAt: new Date().toISOString(),
    // updatedAt: new Date().toISOString()
  };

  it('should render the task title', () => {
    render(<TaskCard task={mockTask} onClick={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Complete the backend API')).toBeInTheDocument();
  });

  it('should display the correct status badge', () => {
    render(<TaskCard task={mockTask} onClick={vi.fn()} onDelete={vi.fn()} />);
    
    // Check if status text is visible
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should display the priority badge', () => {
    render(<TaskCard task={mockTask} onClick={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
