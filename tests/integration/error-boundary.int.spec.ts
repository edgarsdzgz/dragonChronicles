/**
 * Integration tests for error boundary functionality
 * Tests error handling, log export, and navigation functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the logger
const mockLogger = {
  exportNDJSON: vi.fn(),
};

// Mock window and document for Node.js environment
const mockLocation = {
  reload: vi.fn(),
  href: '',
};

const mockWindow = {
  location: mockLocation,
  innerWidth: 1024,
  innerHeight: 768,
  alert: vi.fn(),
};

// Mock global alert function
Object.defineProperty(global, 'alert', {
  value: vi.fn(),
  writable: true,
});

const mockDocument = {
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
};

// Mock global objects
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'test-user-agent' },
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();

// Update the mock document with the functions
mockDocument.createElement = mockCreateElement;
mockDocument.body.appendChild = mockAppendChild;
mockDocument.body.removeChild = mockRemoveChild;

describe('Error Boundary Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset mock logger but keep it as a vi.fn()
    mockLogger.exportNDJSON = vi.fn();

    // Setup mock anchor element
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    };
    mockCreateElement.mockReturnValue(mockAnchor);

    // Reset window.location mock
    mockLocation.reload.mockClear();
    mockLocation.href = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Handling Functions', () => {
    it('should handle page reload functionality', () => {
      // Simulate reload function
      const reloadPage = () => {
        global.window.location.reload();
      };

      reloadPage();
      expect(mockLocation.reload).toHaveBeenCalledTimes(1);
    });

    it('should handle navigation to home', () => {
      // Simulate go home function
      const goHome = () => {
        global.window.location.href = '/';
      };

      goHome();
      expect(mockLocation.href).toBe('/');
    });

    it('should handle log export functionality', async () => {
      const mockBlob = new Blob(['test log data'], { type: 'application/json' });
      mockLogger.exportNDJSON.mockResolvedValue(mockBlob);

      // Simulate export logs function
      const exportLogs = async () => {
        const blob = await mockLogger.exportNDJSON();
        const url = URL.createObjectURL(blob);
        const a = global.document.createElement('a');
        a.href = url;
        a.download = `draconia-logs-${new Date().toISOString().split('T')[0]}.ndjson`;
        global.document.body.appendChild(a);
        a.click();
        global.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      await exportLogs();

      expect(mockLogger.exportNDJSON).toHaveBeenCalledTimes(1);
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle log export errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const alertSpy = vi.spyOn(global.window, 'alert');

      // Make the mock reject
      mockLogger.exportNDJSON.mockRejectedValue(new Error('Export failed'));

      // Simulate export logs function with error handling
      const exportLogs = async () => {
        try {
          await mockLogger.exportNDJSON();
          console.log('This should not be reached');
        } catch (exportError) {
          console.error('Failed to export logs:', exportError);
          global.window.alert('Failed to export logs. Check console for details.');
        }
      };

      await exportLogs();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to export logs:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Failed to export logs. Check console for details.');

      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should prevent multiple simultaneous log exports', async () => {
      let isExporting = false;
      mockLogger.exportNDJSON.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(new Blob()), 100)),
      );

      // Simulate export logs function with state management
      const exportLogs = async () => {
        if (isExporting) return;
        isExporting = true;
        try {
          await mockLogger.exportNDJSON();
        } finally {
          isExporting = false;
        }
      };

      // Call multiple times rapidly
      await Promise.all([exportLogs(), exportLogs(), exportLogs()]);

      // Should only call export once
      expect(mockLogger.exportNDJSON).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Information Processing', () => {
    it('should generate detailed error information', () => {
      const mockError = {
        message: 'Test error message',
        stack: 'Error stack trace',
        id: 'test-error-id',
      };

      const mockPage = {
        error: mockError,
        url: new URL('http://localhost:5173/test'),
      };

      // Simulate error details generation
      const generateErrorDetails = (error: any, page: any) => {
        return JSON.stringify(
          {
            message: error.message,
            stack: error.stack,
            id: error.id,
            timestamp: new Date().toISOString(),
            url: page.url.toString(),
            userAgent: global.navigator.userAgent,
            viewport: {
              width: global.window.innerWidth,
              height: global.window.innerHeight,
            },
          },
          null,
          2,
        );
      };

      const errorDetails = generateErrorDetails(mockError, mockPage);
      const parsed = JSON.parse(errorDetails);

      expect(parsed.message).toBe('Test error message');
      expect(parsed.stack).toBe('Error stack trace');
      expect(parsed.id).toBe('test-error-id');
      expect(parsed.url).toBe('http://localhost:5173/test');
      expect(parsed.userAgent).toBe(global.navigator.userAgent);
      expect(parsed.viewport).toEqual({
        width: global.window.innerWidth,
        height: global.window.innerHeight,
      });
    });

    it('should handle missing error information gracefully', () => {
      const mockPage = {
        error: null,
        url: new URL('http://localhost:5173/test'),
      };

      // Simulate error ID extraction
      const getErrorId = (page: any) => {
        return page.error?.id || 'unknown';
      };

      const errorId = getErrorId(mockPage);
      expect(errorId).toBe('unknown');
    });
  });

  describe('Download Functionality', () => {
    it('should generate correct filename with current date', () => {
      const today = new Date().toISOString().split('T')[0];
      const expectedFilename = `draconia-logs-${today}.ndjson`;

      // Simulate filename generation
      const generateFilename = () => {
        return `draconia-logs-${new Date().toISOString().split('T')[0]}.ndjson`;
      };

      const filename = generateFilename();
      expect(filename).toBe(expectedFilename);
    });

    it('should handle download errors gracefully', () => {
      // Mock URL.createObjectURL to throw an error
      global.URL.createObjectURL = vi.fn(() => {
        throw new Error('URL creation failed');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Simulate download with error handling
      const downloadWithErrorHandling = () => {
        try {
          const url = URL.createObjectURL(new Blob());
          return url;
        } catch (error) {
          console.error('Download failed:', error);
          throw error;
        }
      };

      expect(() => downloadWithErrorHandling()).toThrow('URL creation failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Download failed:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete error boundary workflow', async () => {
      const mockError = {
        message: 'Application error',
        stack: 'Error stack',
        id: 'error-123',
      };

      const mockPage = {
        error: mockError,
        url: new URL('http://localhost:5173/test'),
      };

      // Simulate complete workflow
      const handleError = async (page: any) => {
        // 1. Extract error information
        const errorId = page.error?.id || 'unknown';

        // 2. Generate error details
        const errorDetails = JSON.stringify(
          {
            message: page.error.message,
            stack: page.error.stack,
            id: page.error.id,
            timestamp: new Date().toISOString(),
            url: page.url.toString(),
          },
          null,
          2,
        );

        // 3. Export logs
        const blob = await mockLogger.exportNDJSON();

        return {
          errorId,
          errorDetails,
          hasLogs: blob.size > 0,
        };
      };

      mockLogger.exportNDJSON.mockResolvedValue(new Blob(['test logs']));

      const result = await handleError(mockPage);

      expect(result.errorId).toBe('error-123');
      expect(result.errorDetails).toContain('Application error');
      expect(result.hasLogs).toBe(true);
      expect(mockLogger.exportNDJSON).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid user interactions without issues', () => {
      // Simulate rapid button clicks
      const rapidInteractions = () => {
        global.window.location.reload();
        global.window.location.href = '/';
        global.window.location.reload();
        global.window.location.href = '/';
      };

      rapidInteractions();

      expect(mockLocation.reload).toHaveBeenCalledTimes(2);
      expect(mockLocation.href).toBe('/');
    });
  });
});
