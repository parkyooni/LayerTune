# LayerTune

<p align="center">
  <img src="https://github.com/user-attachments/assets/dfcaba5a-4713-4fed-a770-ab5ca2febd26">
</p>

<p align="center">
LayerTune은 사용자가 웹사이트 레이아웃을 커스터마이징할 수 있도록 돕는 Chrome Extension입니다.<br/> 웹 페이지의 DOM 요소를 원하는 위치로 이동하고 저장하며, 저장된 데이터를 기반으로 다음 방문 시 동일한 레이아웃을 제공합니다.

</p>

<p align="center">
 <a href="https://chromewebstore.google.com/detail/layertune/pedlaplmdpfkmpbmijnkkhmfingpgbbk?authuser=0&hl=ko&pli=1" target="_blank">크롬 확장 프로그램</a><br/>
 GitHub Repo: <a href="https://github.com/parkyooni/LayerTune-Backend" target="_blank">Server</a> <b>|</b> <a href="https://github.com/parkyooni/LayerTune" target="_blank">Client</a>
</p>

 <div align="center">
 <img src="https://img.shields.io/badge/javascript-222222?style=for-the-badge">
 <img src="https://img.shields.io/badge/node-222222?style=for-the-badge">
 <img src="https://img.shields.io/badge/MongoDB-222222?style=for-the-badge">
 <img src="https://img.shields.io/badge/Express-222222?style=for-the-badge">
</div>

## 기능

<!-- toc -->

- [프로젝트 기능 소개](#%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EA%B8%B0%EB%8A%A5-%EC%86%8C%EA%B0%9C)
  - [[요소의 이동] 웹 사이트의 요소 위치를 이동합니다.](#%EC%9A%94%EC%86%8C%EC%9D%98-%EC%9D%B4%EB%8F%99-%EC%9B%B9-%EC%82%AC%EC%9D%B4%ED%8A%B8%EC%9D%98-%EC%9A%94%EC%86%8C-%EC%9C%84%EC%B9%98%EB%A5%BC-%EC%9D%B4%EB%8F%99%ED%95%A9%EB%8B%88%EB%8B%A4)
  - [[요소의 저장] 변경한 웹 사이트를 저장 & 불러옵니다.](#%EC%9A%94%EC%86%8C%EC%9D%98-%EC%A0%80%EC%9E%A5-%EB%B3%80%EA%B2%BD%ED%95%9C-%EC%9B%B9-%EC%82%AC%EC%9D%B4%ED%8A%B8%EB%A5%BC-%EC%A0%80%EC%9E%A5--%EB%B6%88%EB%9F%AC%EC%98%B5%EB%8B%88%EB%8B%A4)
  - [[요소 시각화] 요소 스타일링 및 가이드라인으로 사용자 피드백을 제공합니다.](#%EC%9A%94%EC%86%8C-%EC%8B%9C%EA%B0%81%ED%99%94-%EC%9A%94%EC%86%8C-%EC%8A%A4%ED%83%80%EC%9D%BC%EB%A7%81-%EB%B0%8F-%EA%B0%80%EC%9D%B4%EB%93%9C%EB%9D%BC%EC%9D%B8%EC%9C%BC%EB%A1%9C-%EC%82%AC%EC%9A%A9%EC%9E%90-%ED%94%BC%EB%93%9C%EB%B0%B1%EC%9D%84-%EC%A0%9C%EA%B3%B5%ED%95%A9%EB%8B%88%EB%8B%A4)
- [기술 스택](#%EA%B8%B0%EC%88%A0-%EC%8A%A4%ED%83%9D)
- [크롬 확장프로그램 파일 구조 및 주요 코드 설명](#%ED%81%AC%EB%A1%AC-%ED%99%95%EC%9E%A5%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8-%ED%8C%8C%EC%9D%BC-%EA%B5%AC%EC%A1%B0-%EB%B0%8F-%EC%A3%BC%EC%9A%94-%EC%BD%94%EB%93%9C-%EC%84%A4%EB%AA%85)
- [프로젝트 아키텍처 다이어그램](#%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%EB%8B%A4%EC%9D%B4%EC%96%B4%EA%B7%B8%EB%9E%A8)
- [핵심기능 구현 상세 설명](#%ED%95%B5%EC%8B%AC%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84-%EC%83%81%EC%84%B8-%EC%84%A4%EB%AA%85)
  - [[요소의 표시 및 선택] 모든 웹사이트의 각 요소를 표시하고 선택합니다.](#%EC%9A%94%EC%86%8C%EC%9D%98-%ED%91%9C%EC%8B%9C-%EB%B0%8F-%EC%84%A0%ED%83%9D-%EB%AA%A8%EB%93%A0-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8%EC%9D%98-%EA%B0%81-%EC%9A%94%EC%86%8C%EB%A5%BC-%ED%91%9C%EC%8B%9C%ED%95%98%EA%B3%A0-%EC%84%A0%ED%83%9D%ED%95%A9%EB%8B%88%EB%8B%A4)
    - [모든 사이트에 이동 가능한 요소를 가이드 라인으로 제공합니다.](#%EB%AA%A8%EB%93%A0-%EC%82%AC%EC%9D%B4%ED%8A%B8%EC%97%90-%EC%9D%B4%EB%8F%99-%EA%B0%80%EB%8A%A5%ED%95%9C-%EC%9A%94%EC%86%8C%EB%A5%BC-%EA%B0%80%EC%9D%B4%EB%93%9C-%EB%9D%BC%EC%9D%B8%EC%9C%BC%EB%A1%9C-%EC%A0%9C%EA%B3%B5%ED%95%A9%EB%8B%88%EB%8B%A4)
    - [웹 사이트의 요소에 가이드 라인을 표시합니다.](#%EC%9B%B9-%EC%82%AC%EC%9D%B4%ED%8A%B8%EC%9D%98-%EC%9A%94%EC%86%8C%EC%97%90-%EA%B0%80%EC%9D%B4%EB%93%9C-%EB%9D%BC%EC%9D%B8%EC%9D%84-%ED%91%9C%EC%8B%9C%ED%95%A9%EB%8B%88%EB%8B%A4)
  - [[요소의 이동 방법] 요소 이동은 단일 선택과 다중 선택이 가능합니다.](#%EC%9A%94%EC%86%8C%EC%9D%98-%EC%9D%B4%EB%8F%99-%EB%B0%A9%EB%B2%95-%EC%9A%94%EC%86%8C-%EC%9D%B4%EB%8F%99%EC%9D%80-%EB%8B%A8%EC%9D%BC-%EC%84%A0%ED%83%9D%EA%B3%BC-%EB%8B%A4%EC%A4%91-%EC%84%A0%ED%83%9D%EC%9D%B4-%EA%B0%80%EB%8A%A5%ED%95%A9%EB%8B%88%EB%8B%A4)
  - [[요소의 화면 출력을 위한 저장] 이동한 DOM 요소를 감지하여 위치가 바뀐 정보만 저장합니다.](#%EC%9A%94%EC%86%8C%EC%9D%98-%ED%99%94%EB%A9%B4-%EC%B6%9C%EB%A0%A5%EC%9D%84-%EC%9C%84%ED%95%9C-%EC%A0%80%EC%9E%A5-%EC%9D%B4%EB%8F%99%ED%95%9C-dom-%EC%9A%94%EC%86%8C%EB%A5%BC-%EA%B0%90%EC%A7%80%ED%95%98%EC%97%AC-%EC%9C%84%EC%B9%98%EA%B0%80-%EB%B0%94%EB%80%90-%EC%A0%95%EB%B3%B4%EB%A7%8C-%EC%A0%80%EC%9E%A5%ED%95%A9%EB%8B%88%EB%8B%A4)
  - [[저장한 DOM 요소를 웹 사이트에 출력] 웹 사이트의 DOM 구조가 변경되면 과거 저장한 정보가 맞지 않을 수 있습니다.](#%EC%A0%80%EC%9E%A5%ED%95%9C-dom-%EC%9A%94%EC%86%8C%EB%A5%BC-%EC%9B%B9-%EC%82%AC%EC%9D%B4%ED%8A%B8%EC%97%90-%EC%B6%9C%EB%A0%A5-%EC%9B%B9-%EC%82%AC%EC%9D%B4%ED%8A%B8%EC%9D%98-dom-%EA%B5%AC%EC%A1%B0%EA%B0%80-%EB%B3%80%EA%B2%BD%EB%90%98%EB%A9%B4-%EA%B3%BC%EA%B1%B0-%EC%A0%80%EC%9E%A5%ED%95%9C-%EC%A0%95%EB%B3%B4%EA%B0%80-%EB%A7%9E%EC%A7%80-%EC%95%8A%EC%9D%84-%EC%88%98-%EC%9E%88%EC%8A%B5%EB%8B%88%EB%8B%A4)
- [기능 구현 과정](#%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84-%EA%B3%BC%EC%A0%95)
  - [익스텐션에서 구글 소셜 로그인 구현](#%EC%9D%B5%EC%8A%A4%ED%85%90%EC%85%98%EC%97%90%EC%84%9C-%EA%B5%AC%EA%B8%80-%EC%86%8C%EC%85%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84)
- [프로젝트 회고](#%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%ED%9A%8C%EA%B3%A0)

<!-- tocstop -->

## 프로젝트 기능 소개

### [요소의 이동] 웹 사이트의 요소 위치를 이동합니다.

<p align="center">
    <img src="https://github.com/user-attachments/assets/b30c4f20-f5f1-47a7-8b00-9bd6ebac9ae7" style="width: 100%" height="auto" ><br/>
    <span style="display: inline-block" align="center">모든 웹사이트에서 DOM 요소를 선택하고 자유롭게 이동할 수 있습니다.
</span>
</p>
<br/>

- 단일 요소와 다중 요소 이동을 지원하며, Ctrl/Shift 키를 활용한 직관적인 조작 방식을 제공합니다.
  | 단일 선택 | 다중 선택 |
  | :-------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------: |
  | ![단일 선택](https://github.com/user-attachments/assets/baf45f5c-55d1-4005-a6d0-df252b3e1e3c) | ![다중 선택](https://github.com/user-attachments/assets/f5bb8e1c-317d-46d1-8e81-bcc7151ef3d3) |
  | 단일 선택 시 이동 중인 요소를 원하는 위치로 이동하면 서로의 위치가 바뀝니다. | 다중 선택 시 이동 중인 요소를 원하는 위치의 다음 요소의 위치로 추가합니다. |

### [요소의 저장] 변경한 웹 사이트를 저장 & 불러옵니다.

<p align="center">
    <img src="https://github.com/user-attachments/assets/1e643829-d5f9-4171-a3dd-55c582b88133" width="700" height="auto" ><br/>
    <span style="display: inline-block" align="center">
    - 변경된 DOM 요소의 상태를 서버에 저장하고, 이후 저장된 정보를 기반으로 화면을 복원합니다. <br/>
    - 로그인 후 저장된 레이아웃을 불러오거나 수정할 수 있습니다.</span>
</p>
<br/>

|                                           원본 웹 사이트                                           |                                           변경한 웹 사이트                                           |
| :------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: |
| ![원본 웹 사이트](https://github.com/user-attachments/assets/116983e7-ff56-48fe-abaa-36d5942cb510) | ![변경한 웹 사이트](https://github.com/user-attachments/assets/4c829ea7-65da-4015-8370-80d413d95026) |
|                               요소의 이동이 일어 나지 않은 웹 사이트                               |                                 요소의 이동 및 저장한 후의 웹 사이트                                 |

### [요소 시각화] 요소 스타일링 및 가이드라인으로 사용자 피드백을 제공합니다.

<p align="center">
    <img src="https://github.com/user-attachments/assets/ede1f07a-4d2f-4a70-be99-b6b1925c3a66" width="700" height="auto" ><br/>
    <span style="display: inline-block" align="center">
    - 이동 가능한 요소에는 점선(outline) 가이드라인을 표시하여 시각적 피드백을 제공합니다. <br/>
</p>

## 기술 스택

<p align="center">
    <img src="https://github.com/user-attachments/assets/3aff9dd2-3a65-4855-b7cc-c2b1c775972b"  ><br/>
</p>

### Client -

![Javascript](https://img.shields.io/badge/Javascript-%23404d59.svg?style=for-the-badge&logo=Javascript&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23404d59.svg?style=for-the-badge&logo=vite&logoColor=w)
![fetchAPI](https://img.shields.io/badge/fetchAPI-%23404d59.svg?style=for-the-badge&logo=fetchAPI&logoColor=w)
![Chrome AP](https://img.shields.io/badge/Chrome%20API-%23404d59.svg?style=for-the-badge&logo=Chrome%20AP&logoColor=CC6699)
![SCSS](https://img.shields.io/badge/Scss-%23404d59.svg?style=for-the-badge&logo=SaSS&logoColor=CC6699)

### Server -

![NodeJS](https://img.shields.io/badge/node.js-404d59?style=for-the-badge&logo=node.js&logoColor=6DA55F)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB & MongoDB Atlas & Mongoose](https://img.shields.io/badge/MongoDB%20&%20MongoDB%20Atlas%20&%20Mongoose-%23404d59.svg?style=for-the-badge&logo=mongodb&logoColor=w)

### Deploy & Authentication -

![Amazon Web Service](https://img.shields.io/badge/amazon%20web%20service-%23404d59.svg?style=for-the-badge&logo=amazon&logoColor=b)
![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-%23404d59.svg?style=for-the-badge&logo=Chrome%20Web%20Store&logoColor=b)
![Google OAuth2](https://img.shields.io/badge/Google%20OAuth2-%23404d59.svg?style=for-the-badge&logo=OAuth2&logoColor=b)

## 크롬 확장프로그램 파일 구조 및 주요 코드 설명

```
📂 src
 ├── 📂 popup      # 사용자 인터페이스(UI) 관련 파일 및 저장, 되돌리기 등 주요 UI 로직 및 html
 ├── 📂 content    # DOM 조작 및 브라우저와의 상호작용 (popup <=> content), MutationObserver 활용
 ├── 📂 background # 확장 프로그램의 전역 상태와 명령어 처리 (Chrome API)
 ├── 📂 common     # 전역 변수 및 상태 관리 정의
 ├── 📂 config     # 상수, DOM 요소 캐싱 및 설정 파일 정의
 ├── 📂 utils      # 재사용 가능한 함수 정의
 ├── 📂 styles     # 프로젝트 스타일(SCSS) 정의
 ├── 📂 api        # 백엔드와의 API 통신
 └── vite.config.js # Vite 빌드 및 크롬 익스텐션 설정(manifest.json)
```

## 프로젝트 아키텍처 다이어그램

<img src="https://github.com/user-attachments/assets/9e60148b-c6b6-4262-b00e-78b8e560b6e8" ><br/>

## 핵심기능 구현 상세 설명

> 기능 구현 중에 발생한 챌린지로 <b> `기능 구체화 > 해결 방안 및 결과 > 개선점` </b> 순서로 작성합니다.

### [요소의 표시 및 선택] 모든 웹사이트의 각 요소를 표시하고 선택합니다.

#### 모든 사이트에 이동 가능한 요소를 가이드 라인으로 제공합니다.

> 이 익스텐션은 모든 사이트에서 이동 가능한 요소를 가이드라인으로 제공합니다. 브라우저 웹 페이지의 요소들은 DOM의 요소를 의미하며, DOM은 HTML 태그를 포함하고 있습니다. 그중 div와 시맨틱 태그 요소만을 탐색하여 접근합니다. 이러한 요소에 별도의 표시를 하여 사용자가 이동 가능한 범위를 쉽게 이해할 수 있도록 의도하였습니다.

##### 기능 구체화 <br/>

웹사이트마다 개발 방식이 다양하므로, div와 시맨틱 태그만으로 구성된 웹사이트는 아닐 수 있습니다. 이로 인해 다양한 계층으로 구성된 웹사이트에서 공통적인 요소를 한눈에 탐색하기 어려운 경우가 있습니다. 이러한 상황에서는 사용자가 제한적으로 일부 요소만 변경할 수 있으므로, DOM이 가진 HTML 요소 전체에 접근할 수 있는 확장성을 통해 개선해야 합니다.

##### 방안 적용 및 결과 <br/>

웹사이트에서 DOM 요소를 탐색할 때 HTML 전체가 아닌 body 태그를 기준으로 그 자식 요소들을 전부 탐색합니다. 사용자가 이동하고자 하는 요소에 접근하여 자유롭게 위치를 변경할 수 있도록 하여 사용자 경험을 개선하였습니다. 이때, 사용자가 요소를 쉽게 다룰 수 있도록 <a href="#4-%EB%8B%A8%EC%B6%95%ED%82%A4-%ED%95%9C-%EB%B2%88%EC%9D%98-%EC%8A%A4%EC%9C%84%EC%B9%AD%EC%9C%BC%EB%A1%9C-%EB%91%90-%EA%B0%9C-%EC%9D%B4%EC%83%81%EC%9D%84-%EB%8B%A4%EB%A4%84-%EB%B4%85%EC%8B%9C%EB%8B%A4">단축키 기능을 추가</a>하여 간단하고 직관적인 조작 방법으로 요소를 선택하고 이동할 수 있도록 기능을 개선하였습니다.

##### 개선점 <br/>

사용자 시점에서 고려해야 할 두 가지 부분은 다음과 같습니다 :

1. 선택한 요소의 범위, 즉 계층을 시각적으로 분리하여 사용자에게 표시할 것인지.
2. 선택 가능한 요소를 한눈에 보여주고, 실시간으로 요소의 위치가 변경 가능한지 표시할 것인지.

위치 이동이 가능한 요소들에는 점선 표기를 통해 초기 가이드라인을 제공하여, 사용자에게 한눈에 알아보기 쉽게 안내합니다.

<p align="center">
  <img src="https://github.com/user-attachments/assets/6f7e7348-ae59-4247-8e4f-9c23d61ffca1" width="700" height="auto" ><br/>
  <span style="display: inline-block" align="center">웹사이트에서 이동 가능한 요소들을 점선 가이드로 표시하여, 사용자가 쉽게 요소를 선택할 수 있도록 안내합니다.</span>
</p>

#### 웹 사이트의 요소에 가이드 라인을 표시합니다.

> 웹사이트의 각 요소에 가이드라인 표시로 이동 가능한 요소들을 CSS의 border 속성을 추가하여 표시합니다.

##### 기능 구체화 <br/>

특정 웹사이트의 각 요소를 이동 가능하게 표시하기 위해 CSS의 border 속성을 적용하였으나, 여러 웹사이트를 테스트하는 과정에서 가이드라인 표시를 적용했을 때 요소들이 가진 넓이가 무너지는 현상이 발생했습니다. 이에 따라 다른 CSS 속성을 적용하기로 하였습니다.

##### 방안 적용 및 결과 <br/>

CSS의 border 속성은 넓이 값을 추가하여 표시되며, display: flex와 같은 레이아웃 방식이 아닌 고정된 넓이 값을 가진 padding, margin 등의 속성으로 인해 웹사이트의 각 요소들이 무너지는 현상이 발생할 수 있습니다. 이 경우, border 대신 outline 속성을 사용하여 각 요소의 경계 표시를 외부로 이동시킴으로써 문제를 개선할 수 있습니다.

|                                                         변경 전                                                         |                                                         변경 후                                                         |
| :---------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: |
| <img src="https://github.com/user-attachments/assets/632ca3d5-a3c2-4a89-85e2-44a056180315" width="auto" height="auto" > | <img src="https://github.com/user-attachments/assets/d01e455d-3b90-4407-ae1c-1ed830496fc6" width="auto" height="auto" > |
|                                        무너짐이 발생한 border 속성의 가이드 라인                                        |                                    무너짐이 발생 하지않은 outline 속성의 가이드 라인                                    |

<hr/>

### [요소의 이동 방법] 요소 이동은 단일 선택과 다중 선택이 가능합니다.

> "하나 이상의 요소를 한 번에 이동할 수는 없을까?"라는 질문을 바탕으로, 요소를 선택하고 이동하는 기능을 구현하고 테스트하는 과정에서 하나의 요소만 이동하는 것에서 확장하여 하나 이상의 요소를 이동하고, 이동한 위치에 추가하는 방법으로 사용자 경험을 개선하기로 하였습니다.<br/>

#### 기능 구체화 <br/>

간단한 조작으로 단축키를 추가하여 단일 선택과 다중 선택을 사용자 편의성을 고려하여 구현하였습니다. 단일 선택으로 요소를 이동하는 경우와 다중 선택으로 요소의 위치를 추가하는 기능을 구상하여 적용하였습니다.

단축키 조작 방법은 아래와 같습니다 :

| 조작 방법 |                   단일 선택                    |                         다중 선택                         |
| :-------- | :--------------------------------------------: | :-------------------------------------------------------: |
| 선택      |  **마우스 좌측 클릭**으로 요소를 선택합니다.   |     **Shift + 마우스 좌측 클릭**으로 다중 선택합니다.     |
| 해제      | 선택된 요소는 마우스 좌측 클릭하여 해제합니다. |  선택된 상태에서 Shift 클릭하여 특정 선택을 해제합니다.   |
| 이동      | **Ctrl + 마우스 좌측 클릭** 상태로 이동합니다. | **Ctrl + 마우스 좌측 클릭**으로 그룹화 상태로 이동합니다. |

#### 방안 적용 및 결과 <br/>

요소를 이동하는 동안 요소의 위치를 실시간으로 보여주는 기능을 추가하여 사용자에게 요소의 최종 위치를 안내함으로써 사용자 경험을 개선하였습니다.<br/>

<p align="center">
  <img src="https://github.com/user-attachments/assets/cf23c187-44a5-49f8-8bf5-2f0c1a8b64f4" width="500" height="auto"><br/>
  <span style="display: inline-block" align="center">선택한 요소가 이동 중일 때 실시간으로 요소들의 위치들을 표시해 줍니다.</span>
</p>

### [요소의 화면 출력을 위한 저장] 이동한 DOM 요소를 감지하여 위치가 바뀐 정보만 저장합니다.

> 사용자가 웹 페이지에서 특정 요소를 이동하거나 수정한 뒤 저장할 수 있는 기능을 제공합니다. `MutationObserver`로 DOM 변화를 실시간으로 감지하고, 저장된 정보는 `XPath`, `ID`, `CSS Selector`를 기반으로 정확히 위치를 추적해 복원합니다.

#### 기능 구체화 - `DOM 변경 감지 및 저장` <br/>

<b>1. `MutationObserver`로 실시간 DOM 변경 감지</b> <br/>
DOM의 추가, 삭제, 속성 변경을 감지하는 MutationObserver API를 활용해 변경된 요소의 ID, 클래스, 스타일 등 주요 정보를 기록하여 데이터 용량을 줄이고 성능을 최적화합니다.

<p align="center">
  <img src="https://github.com/user-attachments/assets/560c0b44-a00d-46f6-8fc4-438557f385c4" width="500" height="auto"><br/>
<span style="display: inline-block" align="center">MutationObserver를 활용한 DOM 변경을 감지하고 처리하는 과정의 다이어그램</span>
</p>

<b>2. 변경된 요소를 `XPath`와 `CSS Selector`로 저장</b> <br/>
`XPath`는 DOM 요소의 정확한 경로를 나타내며 DOM 구조가 크게 변경되지 않는 한 요소를 정확히 식별합니다.
CSS Selector는 요소의 ID와 클래스를 기반으로 보조 추적 수단을 제공하여 XPath가 불안정한 경우 대체로 활용됩니다.

#### 방안 적용 및 결과 <br/>

변경된 DOM 요소는 아래 JSON 형식으로 저장됩니다.

```javascript
{
  "userId": "1091015271...",
  "url": "https://www.example.com",
  "customName": "커스텀 사이트",
  "elementChanges": {
    "elementId": "0.4.0.0",
    "updatedElementId": "0.4.2.0",
    "elementXPath": "/html[1]/body[1]/div[2]/div[2]/div[1]",
    "updatedAttributes": {
      "class": "example-class",
      "data-id": "0.4.0.0"
    },
    "updatedStyles": {
      "background-color": "rgba(0, 0, 0, 0.5)",
      "font-size": "14px"
    }
  }
}
```

`MutationObserver`를 통해 실시간으로 DOM 변화를 감지하고 저장된 데이터를 기반으로 변경된 위치와 속성을 적용하고 동일한 URL에 접속 시 저장된 커스터마이징이 반영됩니다.

### [저장한 DOM 요소를 웹 사이트에 출력] 웹 사이트의 DOM 구조가 변경되면 과거 저장한 정보가 맞지 않을 수 있습니다.

> 웹사이트 DOM 구조가 변경되면 저장된 정보와 일치하지 않을 가능성이 있습니다. 저장된 데이터를 활용해 요소의 위치와 속성을 복원하되, 구조 변경이나 동적 로딩 환경에서는 일부 제약이 있을 수 있습니다.

#### 기능 구체화 <br/>

<b>1. 저장된 데이터 출력 프로세스</b> <br/>
페이지 로드 시 `elementChanges` 데이터를 불러오고 저장된 `XPath`, `ID`, `CSS Selector`와 현재 DOM을 비교하여 일치하는 요소를 탐색합니다.
해당 요소에 저장된 속성(updatedAttributes)과 스타일(updatedStyles)을 적용합니다.<br/>

<b>2. XPath와 식별자 ID를 통한 요소 위치 확인</b> <br/>
기본적으로 XPath를 기준으로 요소를 탐색하고 XPath가 유효하지 않은 경우 식별자 ID를 탐색 수단으로 활용합니다.
`MutationObserver`를 통해 실시간 DOM 변경에도 대응할 수 있도록 구현했습니다.<br/>

<b>3. 시각적 피드백 제공</b> <br/>
사용자 경험 개선을 위해 변경된 요소에 일시적으로 배경색을 적용하여 변경 사항이 반영되었음을 시각적으로 피드백합니다.

#### 방안 적용 및 결과 <br/>

저장된 데이터를 통해 사용자 커스터마이징이 반영되며 실시간으로 DOM 변경 사항을 감지 및 복원하여 빠르고 일관된 사용자 경험을 제공합니다.

#### 개선점 <br/>

- XPath의 불안정성 - <br/>
  웹사이트 리뉴얼이나 DOM 구조 변경 시 기존 XPath로 요소를 탐지하지 못할 가능성을 보완하기 위해 CSS Selector를 함께 저장하고 활용할 계획으로 요소 탐지가 더욱 안정적이고 유연해질 것입니다.

- 동적 로딩 문제 - <br/>
  무한 스크롤 및 Lazy Loading을 사용하는 웹사이트에서는 초기 로드 시 모든 요소를 감지하지 못할 수 있기에 위해 스크롤 이벤트와 동적 로딩을 감지하는 추가 로직을 설계하고 적용할 예정입니다.

이러한 개선은 사용자 경험을 더욱 안정적이고 직관적으로 만들고 변경된 DOM 구조에서도 저장된 데이터를 효과적으로 활용할 수 있도록 도울 것입니다.

## 기능 구현 과정

### 익스텐션에서 구글 소셜 로그인 구현

> 크롬 브라우저가 설치된 PC에서 구글 소셜 로그인을 통해 사용자가 요소를 이동하고 저장했던 정보를 현재 웹사이트 화면에 불러오는 기능을 구현해야 합니다.

#### 구체화 <br/>

크롬 익스텐션 공식 문서에 따르면, `manifest.json` 파일에 firebase/auth/web-extension 코드를 추가하면 구글 소셜 로그인 관련 로직을 쉽게 사용할 수 있습니다. 그러나 Google Cloud 문서에 따르면 Chrome 확장 프로그램 사용자 로그인 기준에서 일부 기능은 무료로 제공되지만, 로그인 관련 추가 요구 사항이 발생할 경우 무료 사용이 어려울 수 있습니다. 이러한 추가 요구 사항은 배포 환경에서 로그인 기능에 제한을 줄 가능성이 있습니다.

따라서 크롬 익스텐션 API를 최우선으로 사용해야 하는 정책에 따라, 다른 구글 로그인이 가능한 방법을 탐색하고 Google Cloud의 OAuth 방식을 활용하여 `manifest.json`의 OAuth2에 로그인 기능을 정의하기로 결정했습니다.

#### 방안 적용 및 결과 <br/>

익스텐션에서 로그인 버튼을 클릭하면 구글 로그인이 정상적으로 진행되는 것을 확인했습니다. 로그인이 성공적으로 이루어지면 Google Cloud에 토큰을 요청하고, 익스텐션 API의 스토리지에 로그인 정보를 저장합니다.

#### 개선점 <br/>

구글 계정은 1인당 여러 개를 생성할 수 있는 특징이 있습니다. 따라서 사용자가 다른 구글 계정으로 로그인이 가능하도록 하는 기능이 필요합니다. 이를 위해 크롬 익스텐션 API에 저장된 구글 로그인 정보를 제거하는 기능을 추가하여 사용자가 다른 계정으로 자유롭게 로그인할 수 있도록 개선할 예정입니다.

<hr/>

## 프로젝트 회고

자주 방문하는 웹사이트에서 카테고리를 찾기 위해 매번 스크롤을 내리는 불편함이 있었습니다. 이러한 불편함을 개선하고자 웹사이트의 DOM 요소를 사용자가 원하는 형식으로 재배치하고 저장할 수 있는 기능을 구현하는 프로젝트를 시작하게 되었습니다.

크롬 익스텐션을 선택한 것은 외부 웹사이트의 DOM 요소를 직접 조작하고 저장하거나 출력하는 기능 구현에 적합하다고 판단했기 때문입니다. 특히 크롬 브라우저의 V8 엔진이 JavaScript에 최적화되어 있어 성능적 이점을 활용하기 위해 JavaScript를 주요 개발 언어로 선택했습니다.

개발 과정에서 DOM 변경 사항을 효율적으로 처리하기 위해 React의 가상 DOM과 비교 알고리즘(재조정, Reconciliation)을 학습했습니다. 이를 통해 React가 UI를 효율적으로 업데이트하는 원리를 이해할 수 있었고, 프로젝트의 기술 설계에도 이를 참고하여 적용했습니다.

프로젝트 진행 중에 웹사이트의 DOM 구조가 업데이트될 경우 저장된 DOM 정보와 불일치하는 문제가 발생할 수 있다는 점을 발견했습니다. 이를 해결하기 위해 XPath를 활용해 변경된 DOM 요소를 추적하고, 필요한 경우 변경된 부분만 선택적으로 적용하는 방안을 설계했습니다. React의 동작 원리를 참고하며 전체 DOM을 스냅샷으로 저장하는 대신 변경된 요소만 저장하도록 최적화하여 불필요한 연산을 줄이고 성능을 개선할 수 있었습니다.

이번 프로젝트를 통해 DOM 조작과 관련된 다양한 기술을 실무적으로 적용하는 경험을 쌓을 수 있었습니다. React의 Virtual DOM과 비교 알고리즘을 학습하면서 DOM 업데이트의 효율성을 체감할 수 있었으며, 크롬 익스텐션 개발을 통해 DOM 조작 및 크롬 아키텍처에 대한 이해도를 높일 수 있었습니다. 특히 XPath를 활용한 DOM 변경 추적과 비교 알고리즘 설계는 기술적 역량을 한 단계 성장시키는 계기가 되었습니다.

향후에는 이번 프로젝트에서 습득한 DOM 조작 및 비교 기술을 바탕으로 더 효율적인 방법을 탐구하고, 사용자 경험을 지속적으로 개선할 계획입니다. 이러한 크롬 익스텐션 개발 경험은 앞으로의 웹 기술 프로젝트의 든든한 기반이 될 것이라 확신합니다.
