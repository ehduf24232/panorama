import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    /* text-size-adjust 호환성 */
    text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }

  body {
    /* user-select 호환성 */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* filter 호환성 */
  .filter-effect {
    filter: blur(10px);
    -webkit-filter: blur(10px);
  }

  /* backdrop-filter 호환성 */
  .backdrop-effect {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }

  /* forced-color-adjust 호환성 */
  .forced-colors {
    -ms-high-contrast-adjust: none;
  }

  /* 이미지 셋 호환성 */
  .custom-image {
    content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAQMAAABvIyEEAAAABlBMVEUAAABTU1OoaSf/AAAAAXRSTlMAQObYZgAAADtJREFUKM9jYBgFRIP///8/wM16wGAhg5fF3ICbVYCfZf8fD4uBgXlAWPx/8LEKmJvxsCiwFxji/3GyANQXWAZOSFkcAAAAAElFTkSuQmCC");
  }

  /* 접근성 관련 스타일 */
  button, 
  [role="button"] {
    cursor: pointer;
    &:not(:disabled) {
      &:focus {
        outline: 2px solid #3498db;
        outline-offset: 2px;
      }
    }
  }

  /* 이미지 접근성 */
  img {
    &:not([alt]) {
      outline: 2px solid red;
    }
  }

  /* 폼 요소 접근성 */
  input, 
  select, 
  textarea {
    &:not([title]):not([aria-label]):not([placeholder]) {
      outline: 2px solid red;
    }
  }

  /* viewport 관련 스타일 */
  @viewport {
    width: device-width;
    zoom: 1.0;
  }
  @-ms-viewport {
    width: device-width;
  }
`; 