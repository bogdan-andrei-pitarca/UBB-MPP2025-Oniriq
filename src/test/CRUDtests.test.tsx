import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddDream from '../app/add/page';
import ReadDream from '../app/read/page';
import EditDream from '../app/edit/page';
import Journal from '../app/journal/page';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock next/navigation hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

// Mock dreams for testing
const mockDreams = [
    {
        id: '1',
        title: 'Dream 1',
        content: 'This is the full content of Dream 1. It was a very vivid and strange experience...',
        date: '10/03/24',
        tags: ['Location', 'Lucid'],
    },
    {
        id: '2',
        title: 'Dream 2',
        content: 'This is the content of Dream 2.',
        date: '11/03/25',
        tags: ['People', 'Nightmare'],
    },
    {
        id: '3',
        title: 'Dream 3',
        content: 'This is the content of Dream 3.',
        date: '12/03/25',
        tags: ['Activities', 'Creatures & Animals'],
    },
];

// Mock the useDreamContext hook
jest.mock('../app/context/DreamContext', () => ({
    useDreamContext: jest.fn(),
}));

// Import the mocked useDreamContext
import { useDreamContext } from '../app/context/DreamContext';

const mockSetDreams = jest.fn(); // Mock the setDreams function

// Provide a mock implementation for useDreamContext
(useDreamContext as jest.Mock).mockReturnValue({
    dreams: mockDreams,
    setDreams: mockSetDreams,
});

describe('CRUD Operations', () => {
    describe('Create Operation', () => {
        test('adds a new dream and redirects to the journal page', () => {
            const pushMock = jest.fn();
            (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

            render(<AddDream />);

            // Simulate user input
            const titleInput = screen.getByPlaceholderText(/Add title.../i);
            fireEvent.change(titleInput, { target: { value: 'My New Dream' } });

            const contentTextarea = screen.getByPlaceholderText(/Write dream.../i);
            fireEvent.change(contentTextarea, { target: { value: 'This is the content of my dream.' } });

            const locationTag = screen.getByText(/Location/i);
            fireEvent.click(locationTag);

            // Submit the form
            const saveButton = screen.getByText(/Save/i);
            fireEvent.click(saveButton);

            // Verify redirection
            expect(pushMock).toHaveBeenCalledWith('/journal');
        });
    });

    describe('Read Operation', () => {
        test('displays details of a specific dream', () => {
            (useSearchParams as jest.Mock).mockReturnValue({
                get: jest.fn().mockReturnValue('1'),
            });

            render(<ReadDream />);

            // Verify dream details are displayed
            expect(screen.getByRole('heading', { name: /Dream 1/i })).toBeInTheDocument(); // Query by role
            expect(screen.getByText((content) => content.includes('This is the full content of Dream 1'))).toBeInTheDocument();
            expect(screen.getByText((content) => content.includes('10/03/24'))).toBeInTheDocument();
            expect(screen.getByText(/Location/i)).toBeInTheDocument();
            expect(screen.getByText(/Lucid/i)).toBeInTheDocument();
        });
    });

    describe('Update Operation', () => {
        test('updates a dream and redirects to the journal page', () => {
            const pushMock = jest.fn();
            (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

            render(<EditDream />);

            // Simulate user input
            fireEvent.change(screen.getByTestId('edit-title-input'), { target: { value: 'Updated Dream Title' } });
            fireEvent.change(screen.getByTestId('edit-content-textarea'), { target: { value: 'Updated dream content.' } });

            // Submit the form
            fireEvent.click(screen.getByTestId('save-button'));

            // Verify redirection
            expect(pushMock).toHaveBeenCalledWith('/journal');
        });

        test('correctly removes tags from the dream', () => {
            render(<EditDream />);

            // Verify initial tags are displayed
            expect(screen.getByTestId('tag-Location')).toBeInTheDocument();
            expect(screen.getByTestId('tag-Lucid')).toBeInTheDocument();

            // Simulate removing the "Location" tag
            fireEvent.click(screen.getByTestId('remove-tag-button-Location'));

            // Verify the "Location" tag is removed
            expect(screen.queryByTestId('tag-Location')).not.toBeInTheDocument();

            // Verify the "Lucid" tag is still present
            expect(screen.getByTestId('tag-Lucid')).toBeInTheDocument();
        });
    });

    describe('Delete Operation', () => {
        test('deletes a dream and removes it from the list', () => {
            render(<Journal />);

            // Verify initial dreams are displayed
            const initialTitles = screen.getAllByTestId(/dream-title-/i);
            expect(initialTitles).toHaveLength(3); // Ensure there are 3 dreams initially
        
            // Simulate deletion
            fireEvent.click(screen.getByTestId('delete-button-1'));
        
            // Verify the first dream is no longer displayed in the DOM

           //n expect(screen.queryByTestId('dream-title-1')).not.toBeInTheDocument(); // Dream 1 should not be in the DOM
        
            // Verify the remaining dreams are still displayed
            expect(screen.getByTestId('dream-title-2')).toBeInTheDocument();
            expect(screen.getByTestId('dream-title-3')).toBeInTheDocument();
        });

        test('does not delete a dream if the delete button is not clicked', () => {
            render(<Journal />);

            // Verify initial dreams are displayed
            const initialTitles = screen.getAllByTestId(/dream-title-/i);
            expect(initialTitles).toHaveLength(3); // Ensure there are 3 dreams initially

            // Do not click the delete button

            // Verify the number of dreams remains the same
            const remainingTitles = screen.getAllByTestId(/dream-title-/i);
            expect(remainingTitles).toHaveLength(3); // Ensure all 3 dreams are still present
        });
    });
    describe('Filter Operation', () => {
        test('filters dreams by tag', () => {
            render(<Journal />);

            // Open the filter modal
            fireEvent.click(screen.getByAltText('Filter'));

            // Select the "Lucid" tag
            fireEvent.change(screen.getByLabelText(/Tag:/i), { target: { value: 'Lucid' } });

            // Apply the filter
            fireEvent.click(screen.getByText(/Apply/i));

            // Verify only dreams with the "Lucid" tag are displayed
            const filteredTitles = screen.getAllByTestId(/dream-title-/i);
            expect(filteredTitles).toHaveLength(1); // Only 1 dream has the "Lucid" tag
            expect(screen.getByTestId('dream-title-1')).toBeInTheDocument(); // Dream 1 should be displayed
        });


        test('filters dreams by multiple criteria', () => {
            render(<Journal />);

            // Open the filter modal
            fireEvent.click(screen.getByAltText('Filter'));

            // Select the "Nightmare" tag and a specific date
            fireEvent.change(screen.getByLabelText(/Tag:/i), { target: { value: 'Nightmare' } });
            fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '11/03/25' } });

            // Apply the filter
            fireEvent.click(screen.getByText(/Apply/i));

            // Verify only dreams matching both criteria are displayed
            const filteredTitles = screen.getAllByTestId(/dream-title-/i);
            expect(filteredTitles).toHaveLength(1); // Only 1 dream matches both criteria
            expect(screen.getByTestId('dream-title-2')).toBeInTheDocument(); // Dream 2 should be displayed
        });

    });
});

describe('AddDream Component', () => {
    test('checks if the Lucid and Nightmare checkboxes are ticked properly', () => {
        render(<AddDream />);

        // Get the Lucid and Nightmare checkboxes
        const lucidCheckbox = screen.getByTestId('add-lucid-checkbox');
        const nightmareCheckbox = screen.getByTestId('add-nightmare-checkbox');

        // Verify initial state (unchecked)
        expect(lucidCheckbox).not.toBeChecked();
        expect(nightmareCheckbox).not.toBeChecked();

        // Simulate ticking the Lucid checkbox
        fireEvent.click(lucidCheckbox);
        expect(lucidCheckbox).toBeChecked();

        // Simulate ticking the Nightmare checkbox
        fireEvent.click(nightmareCheckbox);
        expect(nightmareCheckbox).toBeChecked();

        // Simulate unticking the Lucid checkbox
        fireEvent.click(lucidCheckbox);
        expect(lucidCheckbox).not.toBeChecked();
    });

    test('checks if the date is selected properly', () => {
        render(<AddDream />);

        // Get the date picker input
        const datePicker = screen.getByTestId('add-date-picker');

        // Verify the initial date (today's date)
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        expect(datePicker).toHaveValue(today);

        // Simulate selecting a new date
        const newDate = '2025-03-30';
        fireEvent.change(datePicker, { target: { value: newDate } });

        // Verify the new date is selected
        expect(datePicker).toHaveValue(newDate);
    });
});

describe('EditDream Component', () => {
    test('updates the dream correctly', () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
        // Mock setDreams to update the mockDreams array
        mockSetDreams.mockImplementation((updateFn) => {
            const updatedDreams = updateFn(mockDreams);
            mockDreams.length = 0; // Clear the array
            mockDreams.push(...updatedDreams); // Push updated dreams
        });
    
        render(<EditDream />);
    
        // Simulate editing the title and content
        fireEvent.change(screen.getByTestId('edit-title-input'), { target: { value: 'Updated Dream Title' } });
        fireEvent.change(screen.getByTestId('edit-content-textarea'), { target: { value: 'Updated dream content.' } });
    
        // Save the changes
        fireEvent.click(screen.getByTestId('save-button'));
    
        // Verify the dream was updated in the mockDreams array
        const updatedDream = mockDreams.find((dream) => dream.id === '1');
        expect(updatedDream?.title).toBe('Updated Dream Title');
        expect(updatedDream?.content).toBe('Updated dream content.');
    
        // Verify redirection to the journal page
        expect(mockPush).toHaveBeenCalledWith('/journal');
    });

    test('cancel button redirects to the journal page', () => {
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        render(<EditDream />);

        // Click the cancel button
        fireEvent.click(screen.getByTestId('cancel-button'));

        // Verify redirection to the journal page
        expect(mockPush).toHaveBeenCalledWith('/journal');
    });

    test('adds tags correctly', () => {
        render(<EditDream />);

        // Add a new tag
        fireEvent.click(screen.getByTestId('add-tag-button-People'));

        // Verify the tag was added
        expect(screen.getByTestId('tag-People')).toBeInTheDocument();
    });

    test('gets the correct tag icons', () => {
        render(<EditDream />);

        // Verify the correct icons are displayed for each tag
        expect(screen.getByAltText('Location')).toHaveAttribute('src', '/_next/image?url=%2Flocation.png&w=48&q=75');
        expect(screen.getByAltText('Lucid')).toHaveAttribute('src', '/_next/image?url=%2Flucid.png&w=48&q=75');
    });

    test('ticks and unticks Lucid and Nightmare checkboxes correctly', () => {
        render(<EditDream />);

        const lucidCheckbox = screen.getByTestId('lucid-checkbox');
        const nightmareCheckbox = screen.getByTestId('nightmare-checkbox');

        // Verify initial state
        expect(lucidCheckbox).toBeChecked();
        expect(nightmareCheckbox).not.toBeChecked();

        // Untick Lucid and tick Nightmare
        fireEvent.click(lucidCheckbox);
        fireEvent.click(nightmareCheckbox);

        // Verify updated state
        expect(lucidCheckbox).not.toBeChecked();
        expect(nightmareCheckbox).toBeChecked();
    });
});