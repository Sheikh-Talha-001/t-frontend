import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '../ProgressBar';
import { Task } from '../../types';

describe('ProgressBar Component', () => {
  it('should render 0% when there are no tasks', () => {
    render(<ProgressBar tasks={[]} />);
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('0%');
  });

  it('should correctly calculate percentage of completed tasks', () => {
    const mockTasks: Partial<Task>[] = [
      { _id: '1', status: 'Completed' },
      { _id: '2', status: 'In Progress' },
      { _id: '3', status: 'Pending' },
      { _id: '4', status: 'Completed' },
    ];

    // 2 completed out of 4 total = 50%
    render(<ProgressBar tasks={mockTasks as Task[]} />);
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('50%');
  });

  it('should round the percentage to nearest whole number', () => {
    const mockTasks: Partial<Task>[] = [
      { _id: '1', status: 'Completed' },
      { _id: '2', status: 'In Progress' },
      { _id: '3', status: 'Pending' },
    ];

    // 1 completed out of 3 total = 33.333% -> 33%
    render(<ProgressBar tasks={mockTasks as Task[]} />);
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('33%');
  });
});
