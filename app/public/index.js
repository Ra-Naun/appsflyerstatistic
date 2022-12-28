const init = () => {
  const inputSource1Element = document.querySelector('.input-source1');
  const inputSource2Element = document.querySelector('.input-source2');
  const reattrElement = document.querySelector('.reattr__select');
  const appIDElement = document.querySelector('.input-appID');
  const fromElement = document.querySelector('.input-from');
  const toElement = document.querySelector('.input-to');
  const event_nameElement = document.querySelector('.input-event_name');
  const geoElement = document.querySelector('.input-geo');
  const apiTokenElement = document.querySelector('.input-apiToken');
  const requestUrlElement = document.querySelector('.request-url__value');
  const requestBtnElement = document.querySelector('.request-container__btn');
  const loaderElement = document.querySelector('.spinner-container');
  const wrapperRequestResultElement = document.querySelector('.wrapper-request-result');
  const requestResultElement = document.querySelector('.request-result');

  const logsShowBtnElement = document.querySelector('.logs-show-btn');
  const wrapperLogsBodyElement = document.querySelector('.wrapper-logs-body');
  const logsBodyElement = document.querySelector('.logs-body');

  const store = {
    requestUrl: '',
    isShowLoader: false,
    isShowRequestResponse: false,
    isFetching: false,
    isOpenLogs: false,
  };

  const pause = (timeout = 1000) => new Promise(resolve => setTimeout(() => resolve(), timeout));

  const changeValue = event => {
    const sources = [
      { active: inputSource1Element.checked, value: inputSource1Element.value },
      { active: inputSource2Element.checked, value: inputSource2Element.value },
    ];

    const source = sources.filter(obj => obj.active)[0].value;

    const reattr = reattrElement.value;

    const appID = appIDElement.value;

    const from = fromElement.value;

    const to = toElement.value;

    const event_name = event_nameElement.value;

    const geo = geoElement.value;

    const apiToken = apiTokenElement.value;

    //

    const parameters = { source, reattr, appID, from, to, event_name, geo, apiToken };

    const query = [];

    for (const name in parameters) {
      const value = parameters[name];
      value && query.push(`${name}=${value}`);
    }

    const queryStr = query.join('&');

    const requestUrl = `/api/fetch-appsflyer-data?${queryStr}`;

    requestUrlElement.textContent = requestUrl;

    store.requestUrl = requestUrl;
  };

  window.onload = changeValue;
  inputSource1Element.addEventListener('change', changeValue);
  inputSource2Element.addEventListener('change', changeValue);
  reattrElement.addEventListener('change', changeValue);
  appIDElement.addEventListener('input', changeValue);
  fromElement.addEventListener('input', changeValue);
  toElement.addEventListener('input', changeValue);
  event_nameElement.addEventListener('input', changeValue);
  geoElement.addEventListener('input', changeValue);
  apiTokenElement.addEventListener('input', changeValue);

  const hideClass = 'hide';

  const toggleVisibleLoader = () => {
    store.isShowLoader = !store.isShowLoader;
    loaderElement.classList[store.isShowLoader ? 'remove' : 'add'](hideClass);
  };

  const toggleDisableRequestBtn = () => {
    requestBtnElement.disabled = store.isFetching;
  };

  const toggleVisibleRequestResponse = isShow => {
    const customIsShowRequestResponse = (isShow ?? store.isShowRequestResponse) || isShow;
    store.isShowRequestResponse = !customIsShowRequestResponse;

    wrapperRequestResultElement.classList[customIsShowRequestResponse ? 'remove' : 'add'](
      hideClass
    );
  };

  const clearLogs = () => {
    requestResultElement.innerHTML = '';
    toggleVisibleRequestResponse(false);
  };

  const requestSaveReport = async () => {
    if (store.isFetching) return;
    store.isFetching = true;
    try {
      toggleDisableRequestBtn();
      clearLogs();
      toggleVisibleLoader();

      const { requestUrl } = store;
      const response = await (await fetch(requestUrl)).json();

      const { message, html } = response;

      if (!Object.keys(message?.requests?.params || {}).length > 0) {
        requestResultElement.innerHTML =
          'For this set of requested data, the report is already saved in the database!';
        toggleVisibleRequestResponse(true);
        setTimeout(() => {
          toggleVisibleRequestResponse(false);
        }, 10000);
      }

      !store.isOpenLogs && toggleCollapseLogs();
    } catch (error) {
      console.log(error);
    } finally {
      toggleVisibleLoader();
      store.isFetching = false;
      toggleDisableRequestBtn();
      await fetchLogs();
    }
  };

  const initFields = async () => {
    try {
      const testConf = await (await fetch('/api/get-default-form-params')).json();

      appIDElement.value = testConf.appID;
      fromElement.value = testConf.from;
      toElement.value = testConf.to;
      event_nameElement.value = testConf.event_name;
      geoElement.value = testConf.geo;
      apiTokenElement.value = testConf.apiToken;
    } catch {}
  };

  initFields();

  requestBtnElement.addEventListener('click', requestSaveReport);

  const toggleCollapseLogs = () => {
    if (!store.isOpenLogs) {
      wrapperLogsBodyElement.classList.remove('collapse');
      wrapperLogsBodyElement.classList.add('collapsing');
      wrapperLogsBodyElement.classList.remove('collapsing');
      wrapperLogsBodyElement.classList.add('collapse');
      wrapperLogsBodyElement.classList.add('show');
    } else {
      wrapperLogsBodyElement.classList.remove('collapse');
      wrapperLogsBodyElement.classList.remove('show');
      wrapperLogsBodyElement.classList.add('collapsing');
      wrapperLogsBodyElement.classList.add('collapse');
    }

    store.isOpenLogs = !store.isOpenLogs;
  };

  const fetchLogs = async () => {
    try {
      const responsePromise = fetch('/api/get-fetch-data-logs');

      const response = await (await responsePromise).json();
      const { html } = response;

      logsBodyElement.innerHTML = html;
    } catch (error) {
      logsBodyElement.innerHTML = 'Error load logs';
      console.log(error);
    }
  };

  logsShowBtnElement.addEventListener('click', async () => {
    !store.isOpenLogs && (await fetchLogs());
    toggleCollapseLogs();
  });
};

init();
