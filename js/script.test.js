
/** @jest-environment jsdom */
const { setupButtons } = require('script.js');

describe('setupButtons', () => {
  const ALERT_MSG = 'This feature will be available when the database is connected!';
  let alertSpy;

  beforeEach(() => {
    document.body.innerHTML = `
      <div>
        <button class="btn btn-download">Download PDF</button>
        <button class="btn btn-view">View Code</button>
        <button class="btn btn-other">Contact Us</button>
        <a href="#" class="btn btn-link">Download Link</a>
      </div>
    `;
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    alertSpy.mockRestore();
  });

  test('only buttons containing "Download" or "View Code" get click handlers', () => {
    setupButtons();
    const other = document.querySelector('.btn-other');
    other.click();
    expect(other.textContent).toBe('Contact Us');
    expect(other.disabled).toBeFalsy();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  test('clicking a "Download" button shows loading state, then restores and alerts', () => {
    setupButtons();
    const download = document.querySelector('.btn-download');
    expect(download.textContent).toBe('Download PDF');
    download.click();
    expect(download.textContent).toBe('Loading...');
    expect(download.disabled).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(download.textContent).toBe('Download PDF');
    expect(download.disabled).toBe(false);
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(ALERT_MSG);
  });

  test('clicking a "View Code" button behaves the same as "Download"', () => {
    setupButtons();
    const viewCode = document.querySelector('.btn-view');
    const original = viewCode.textContent;
    viewCode.click();
    expect(viewCode.textContent).toBe('Loading...');
    expect(viewCode.disabled).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(viewCode.textContent).toBe(original);
    expect(viewCode.disabled).toBe(false);
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  test('existing click handlers are removed when cloning', () => {
    const download = document.querySelector('.btn-download');
    download.addEventListener('click', () => {
      download.dataset.oldHandlerRan = 'yes';
    });
    setupButtons();
    const replaced = document.querySelector('.btn-download');
    replaced.click();
    expect(replaced.dataset.oldHandlerRan).toBeUndefined();
    jest.advanceTimersByTime(1000);
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  test('preventDefault is called on click events', () => {
    setupButtons();
    const linkBtn = document.querySelector('.btn-link');
    const evt = new MouseEvent('click', { bubbles: true, cancelable: true });
    expect(evt.defaultPrevented).toBe(false);
    linkBtn.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  test('calling setupButtons multiple times does not create duplicate handlers', () => {
    setupButtons();
    setupButtons();
    const download = document.querySelector('.btn-download');
    download.click();
    jest.advanceTimersByTime(1000);
    expect(alertSpy).toHaveBeenCalledTimes(1);
    download.click();
    jest.advanceTimersByTime(1000);
    expect(alertSpy).toHaveBeenCalledTimes(2);
  });
});