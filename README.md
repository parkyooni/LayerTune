# LayerTune

<p align="center">
  <img src="https://github.com/user-attachments/assets/dfcaba5a-4713-4fed-a770-ab5ca2febd26">
</p>

<p align="center">
웹 사이트에서 각 콘텐츠를 사용자가 원하는 위치로 변경 할 수 있도록 돕는 Chrome Extension입니다. <br/>
웹 사이트 페이지의 주요 콘텐츠들을 시각적으로 한눈에 확인 가능하고, <br/>
사용자는 간단한 단축키를 통해 drag and drop으로 콘텐츠를 변경하여 나만의 사이트 구성을 보관 할 수 있습니다.
</p>

<p align="center">
 (배포사이트링크) <b>|</b> <a href="https://github.com/parkyooni/LayerTune-Backend" target="_blank">Git Repo LayerTune-Backend</a> <br/><br/>
 <img src="https://img.shields.io/badge/javascript-222222?style=for-the-badge">
<img src="https://img.shields.io/badge/node-222222?style=for-the-badge">
<img src="https://img.shields.io/badge/MongoDB-222222?style=for-the-badge">
<img src="https://img.shields.io/badge/Express-222222?style=for-the-badge">
</p>

## List

<!-- toc -->

- [LayerTune 흐름](#layertune-%ED%9D%90%EB%A6%84)
  - [1. 브라우저화면을 내맘대로](#1-%EB%B8%8C%EB%9D%BC%EC%9A%B0%EC%A0%80%ED%99%94%EB%A9%B4%EC%9D%84-%EB%82%B4%EB%A7%98%EB%8C%80%EB%A1%9C)
  - [2. 버튼하나로 콘텐츠 가동](#2-%EB%B2%84%ED%8A%BC%ED%95%98%EB%82%98%EB%A1%9C-%EC%BD%98%ED%85%90%EC%B8%A0-%EA%B0%80%EB%8F%99)
  - [3. 이건 요기, 저건 쩌~어기로](#3-%EC%9D%B4%EA%B1%B4-%EC%9A%94%EA%B8%B0-%EC%A0%80%EA%B1%B4-%EC%A9%8C%EC%96%B4%EA%B8%B0%EB%A1%9C)
  - [4. 이제 이건 나만의 것](#4-%EC%9D%B4%EC%A0%9C-%EC%9D%B4%EA%B1%B4-%EB%82%98%EB%A7%8C%EC%9D%98-%EA%B2%83)
- [흐름에 따른 사고](#%ED%9D%90%EB%A6%84%EC%97%90-%EB%94%B0%EB%A5%B8-%EC%82%AC%EA%B3%A0)
  - [1. 모든 사이트에 많은 콘텐츠를 가동 시키고 싶습니다.](#1-%EB%AA%A8%EB%93%A0-%EC%82%AC%EC%9D%B4%ED%8A%B8%EC%97%90-%EB%A7%8E%EC%9D%80-%EC%BD%98%ED%85%90%EC%B8%A0%EB%A5%BC-%EA%B0%80%EB%8F%99-%EC%8B%9C%ED%82%A4%EA%B3%A0-%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4)
  - [2. 공든 탑이 무너졌습니다.](#2-%EA%B3%B5%EB%93%A0-%ED%83%91%EC%9D%B4-%EB%AC%B4%EB%84%88%EC%A1%8C%EC%8A%B5%EB%8B%88%EB%8B%A4)
  - [3. 나는 익스텐션에서 구글로 로그인을 하고싶습니다.](#3-%EB%82%98%EB%8A%94-%EC%9D%B5%EC%8A%A4%ED%85%90%EC%85%98%EC%97%90%EC%84%9C-%EA%B5%AC%EA%B8%80%EB%A1%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8%EC%9D%84-%ED%95%98%EA%B3%A0%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4)
  - [4. 단축키, 한번의 스위칭으로 두개 이상을 다뤄 봅시다.](#4-%EB%8B%A8%EC%B6%95%ED%82%A4-%ED%95%9C%EB%B2%88%EC%9D%98-%EC%8A%A4%EC%9C%84%EC%B9%AD%EC%9C%BC%EB%A1%9C-%EB%91%90%EA%B0%9C-%EC%9D%B4%EC%83%81%EC%9D%84-%EB%8B%A4%EB%A4%84-%EB%B4%85%EC%8B%9C%EB%8B%A4)
  - [5. 사용자는 기다림을 좋아하지 않습니다.](#5-%EC%82%AC%EC%9A%A9%EC%9E%90%EB%8A%94-%EA%B8%B0%EB%8B%A4%EB%A6%BC%EC%9D%84-%EC%A2%8B%EC%95%84%ED%95%98%EC%A7%80-%EC%95%8A%EC%8A%B5%EB%8B%88%EB%8B%A4)
    - [a. 동작한다고 표시해 봅시다.](#a-%EB%8F%99%EC%9E%91%ED%95%9C%EB%8B%A4%EA%B3%A0-%ED%91%9C%EC%8B%9C%ED%95%B4-%EB%B4%85%EC%8B%9C%EB%8B%A4-)
    - [b. 대용량을 가볍게 다뤄봅시다.](#b-%EB%8C%80%EC%9A%A9%EB%9F%89%EC%9D%84-%EA%B0%80%EB%B3%8D%EA%B2%8C-%EB%8B%A4%EB%A4%84%EB%B4%85%EC%8B%9C%EB%8B%A4-)
  - [6. 저장한 웹사이트가 리뉴얼되어도 반영 하고싶습니다.](#6-%EC%A0%80%EC%9E%A5%ED%95%9C-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8%EA%B0%80-%EB%A6%AC%EB%89%B4%EC%96%BC%EB%90%98%EC%96%B4%EB%8F%84-%EB%B0%98%EC%98%81-%ED%95%98%EA%B3%A0%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4)
- [프로젝트 회고](#%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%ED%9A%8C%EA%B3%A0)

<!-- tocstop -->

## LayerTune 흐름

### 1. 브라우저화면을 내맘대로

<details>
<summary>미리보기</summary>
<div markdown="1">

<img src="https://github.com/user-attachments/assets/3b3595ec-56b3-4147-931f-377955fc9b1e" alt="콘텐츠 활성화" style="width: 100%" /><br/>
현재 커스텀 링크에서 저장한 리스트를 선택하면 사용자가 저장한 콘텐츠 구조를 보여줍니다.

</div>
</details>

### 2. 버튼하나로 콘텐츠 가동

<details>
<summary>미리보기</summary>

<img src="https://github.com/user-attachments/assets/bb3eca8e-3e11-48c5-980b-f05c856bc4c7" alt="콘텐츠 활성화" style="width: 100%" /><br/>
콘텐츠 영역 활성화 버튼을 클릭하면 웹 페이지에 변경 가능한 콘텐츠들의 가이드 라인이 보입니다.

<div markdown="1">

</div>
</details>

### 3. 이건 요기, 저건 쩌~어기로

<details>
<summary>미리보기</summary>
<div markdown="1">

|                                           단일 선택                                           |                                           다중 선택                                           |
| :-------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------: |
| ![단일 선택](https://github.com/user-attachments/assets/baf45f5c-55d1-4005-a6d0-df252b3e1e3c) | ![다중 선택](https://github.com/user-attachments/assets/f5bb8e1c-317d-46d1-8e81-bcc7151ef3d3) |
|         단일 선택시 이동시킬 콘텐츠를 원하는 위치의 콘텐츠로 이동하면 서로 바뀝니다.          |            다중 선택시 이동시킬 콘텐츠를 원하는 위치의 다음 콘텐츠에 이동시킵니다.            |

</div>
</details>

### 4. 이제 이건 나만의 것

<details>
<summary>미리보기</summary>
<div markdown="1">
<img src="https://github.com/user-attachments/assets/1e643829-d5f9-4171-a3dd-55c582b88133" alt="콘텐츠 활성화" style="width: 100%" /><br/>
저장 하고싶은 콘텐츠를 이름을 정하여 저장하면, 스위칭 탭리스트에 저장한 정보가 조회됩니다.

</div>
</details>

## 흐름에 따른 사고

> 흐름에 따른 사고는 <b> `기획의도 > 구체화 > 해결 방안 및 결과 > 개선점` </b> 수순으로 나열 합니다.

### 1. 모든 사이트에 많은 콘텐츠를 가동 시키고 싶습니다.

기획 의도 : <br/>
&nbsp;&nbsp; 브라우저 웹 페이지의 화면을 보여주는 DOM에서 HTML의 여러 태그 중에 <b>div</b> 와 <b>Semantic Tag</b> 만 상수화로 지정하여 해당하는 부분만 웹사이트 화면에 콘텐츠(이미지,링크 등) 활성화 시켜 사용자가 자유롭게 콘텐츠를 변경 가능하도록 의도 하였습니다. <br/>

구체화 : <br/>
&nbsp;&nbsp; 웹 사이트 마다 작업된 방식이 다양합니다. 즉, div와 Semantic Tag만으로 구성되지않은 웹 페이지와 다양한 계층으로 구성되는 웹 페이지 등 한눈에 공통적인 요소를 탐색하기 어려운 부분이 있습니다. 이럴 경우 사용자는 제한적인 콘텐츠만 변경이 가능하게 되여 DOM의 전체적인 부분으로 접근 콘텐츠를 확장합니다.<br/>

방안 적용 및 결과 : <br/>
&nbsp;&nbsp; 웹 사이트 전체에 DOM을 적용 하는 방식을 HTML의 body를 기준으로 자식 요소들을 전체 탐색하고 사용자가 원하는 요소에 접근하여 자유로운 콘텐츠 변경을 다루는 사용자 경험을 고려하였습니다. <br/><br/>
&nbsp;&nbsp; 사용자가 콘텐츠를 쉽게 접근하고 변경하는 보조 수단으로 단축키 기능을 추가하였으며, 간단하고 통일감 있는 단축키 수단을 통하여 콘텐츠 선택 및 변경 가능하게 기능 개선을 하였습니다.
<br/>
<span style="font-size: 80%">
<a href="#4-%EB%8B%A8%EC%B6%95%ED%82%A4-%ED%95%9C%EB%B2%88%EC%9D%98-%EC%8A%A4%EC%9C%84%EC%B9%AD%EC%9C%BC%EB%A1%9C-%EB%91%90%EA%B0%9C-%EC%9D%B4%EC%83%81%EC%9D%84-%EB%8B%A4%EB%A4%84-%EB%B4%85%EC%8B%9C%EB%8B%A4">[ 4. 단축키, 한번의 스위칭으로 두개 이상을 다뤄 봅시다. ] 과 연계</a>
</span>
<br/>

개선점 : <br/>
&nbsp;&nbsp; 사용자 시점에서 고려 해야하는 부분은 대표적으로 두 가지로 사고 합니다.

1. 선택 가능한 콘텐츠에서 어디까지, 즉 계층을 시각적으로 분리해서 사용자에게 표시해 줄것인가.
2. 활성화된 콘텐츠를 한눈에 보여주고, 사용자에게 어디의 콘텐츠들이 변경 가능한지 표시해 줄것인가.<br/>

&nbsp;&nbsp; 변경 가능한 콘텐츠를 점선 표기로 초기 가이드라인을 제공하여 사용자 시점으로 한눈에 알아보기 쉽게 안내합니다.

  <p align="center">
    <img src="https://github.com/user-attachments/assets/6f7e7348-ae59-4247-8e4f-9c23d61ffca1" width="700" height="auto" ><br/>
    <span style="display: inline-block" align="center">버튼을 활성화 활경우 웹 페이지에 점선이 보여지며, 사용자가 쉽게 콘텐츠를 선택할 수 있게 안내합니다.</span>
  </p>

<hr/>

### 2. 공든 탑이 무너졌습니다.

기획 의도 :<br/>
&nbsp;&nbsp; 콘텐츠 활성화 표시를 border 스타일로 지정 하여, 웹 사이트에서 콘텐츠 활성화 사용자 시각표시를 의도 하였습니다.

구체화 : <br/>
&nbsp;&nbsp; 특정 웹 사이트에서 콘텐츠 활성화 했을때에 사용자 인터페이스를 표현하기 위해 스타일 속성을 border로 표시하여, 콘텐츠 활성화 버튼을 활성화 시켰을때 웹 페이지의 DOM의 요소를 전부 활성화 하는 기능을 구현 하였으나, 웹 사이트 마다 콘텐츠의 넓이와 높이등의 스타일의 속성 방식이 다양하여 일부의 웹 페이지(네이버, 다음)에서 콘텐츠별 넓이의 값에 border의 넓이가 추가되면 콘텐츠 무너짐 현상이 확인 되었습니다.
<br/>

방안 적용 및 결과 : <br/>
&nbsp;&nbsp; border의 스타일 사용으로 양쪽 (왼쪽,오른쪽)에 각 1px씩 총 2px의 넓이가 웹사이트 콘텐츠 마다 새로 추가되는 경우로, 웹 사이트에서 콘텐츠의 넓이 스타일 속성이 display: flex의 방식이 아닌 padding, margin으로 고정된 값 가지고 있을 경우에 발생하는 현상으로 확인하였으며, border속성에서 outline속성으로 변경하여 웹 페이지 마다 무너지는 현상을 개선 하였습니다.
<br/>

|                                                         변경 전                                                         |                                                         변경 후                                                         |
| :---------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: |
| <img src="https://github.com/user-attachments/assets/632ca3d5-a3c2-4a89-85e2-44a056180315" width="auto" height="auto" > | <img src="https://github.com/user-attachments/assets/d01e455d-3b90-4407-ae1c-1ed830496fc6" width="auto" height="auto" > |
|                                     버튼 활성화시 무너지는 현상의 콘텐츠 가이드 선                                      |                                버튼 활성화시 무너짐을 해결하고 점선표시로 전체 가이드 선                                |

<hr/>

### 3. 나는 익스텐션에서 구글로 로그인을 하고싶습니다.

기획 의도 : <br/>
&nbsp;&nbsp; 크롬 및 익스텐션이 있는 PC에서 구글 계정을 통해서 사용자가 저장한 웹 사이트 구조로 이용 가능하게 하고자 익스텐션에 구글 로그인을 firebase auth로 제공해주는 사항을 확인하여 google OAuth login 기능 구현을 정의 하였습니다.

구체화 :<br/>
&nbsp;&nbsp; 크롬 익스텐션에서는 `manifest.json`에 firebase/auth/web-extension 추가하여 자유롭게 사용가능하다고 확인하였으나, Google Cloud 문서의 <b>Chrome 확장 프로그램 사용자 로그인</b> 기준에서 일부 기능은 유료로 확인되어 배포 환경에서 상황에 따라 로그인에 기능적 제한이 발생하는 가능성이 있어, 익스텐션 API를 우선순위로 사용해야하는 필수 조건을 기준으로 정책상 다른 구글 로그인이 필요하여 google Cloud에서 google OAuth 방식으로 `manifest.json`의 OAuth2에 정의하여 로그인 기능을 정의하며, 배포 환경에서 안정적인 로그인을 제공 가능 하도록 하였습니다.

방안 적용 및 결과 : <br/>
&nbsp;&nbsp; 익스텐션 아이콘 실행 후 로그인 버튼을 클릭하여 구글 계정 로그인 창을 확인하고, 그 창에서 계속하기 버튼을 클릭시 정상적으로 구글 로그인되고, 로그인시 토큰을 요청하여 익스텐션 API의 스토리지에 로그인 정보를 저장합니다.
<br/>

개선점 : <br/>
&nbsp;&nbsp; 구글 계정은 1인당 1개 이상 생성 가능한 특징으로 로그인 기능을 통해 다른 계정으로 로그인이 가능하도록 로그아웃시 익스텐션 API에 저장된 구글 로그인 정보를 제거하는 기능을 추가하여, 사용자가 다른 계정으로도 자유롭게 로그인 할 수 있도록 합니다.

<hr/>

### 4. 단축키, 한번의 스위칭으로 두개 이상을 다뤄 봅시다.

사용자 경험을 고려한 확장된 기획 의도 :<br/>

- 기존의 기능은 단일 선택 기능만 가능하고, 선택한 콘텐츠를 이동시 어디 콘텐츠 부분을 이동중인지 사용자가 알 수 없어 사용자에게 불편함을 제공해 주었습니다.
- 다수의 콘텐츠를 동시에 하나의 콘텐츠에 이동 시키고 싶을 경우, 하나씩 이동해야하는 기존 기능으로 인하여 불필요한 작업과 시간이 요소되는 사용자 경험에 좋지 않다고 판단 하였습니다. <br/>

구체화 : <br/>
&nbsp;&nbsp; 통일성을 가진 단축키를 추가하여, 단일 선택으로 변경하는 경우와 다중 선택으로 콘텐츠 위치로 변경 가능 하게 추가 기능을 구상하여 적용 하였습니다. <br/>

|      |                     단일 선택                     |                         다중 선택                          |
| :--- | :-----------------------------------------------: | :--------------------------------------------------------: |
| 선택 |    **마우스 좌측 클릭** 콘텐츠를 선택 합니다.     |     **Shift + 마우스 좌측 클릭**으로 다중 선택 합니다.     |
| 해제 | 선택된 콘텐츠는 마우스 좌측 클릭하여 해제 합니다. |  선택된 상태에서 Shift 클릭하여 특정 선택을 해제 합니다.   |
| 이동 |  **Ctrl + 마우스 좌측 클릭** 상태로 이동 합니다.  | **Ctrl + 마우스 좌측 클릭**으로 그룹화 상태로 이동 합니다. |

방안 적용 및 결과 : <br/>

- 이동중에 어디의 콘텐츠에 놓아질지 실시간으로 시각적 표시를 추가하여 사용자에게 변경한 콘텐츠의 최종 위치를 안내 해주는 사용자 인터페이스 측면에서 확장 하여 적용하였습니다.<br/>

<p align="center">
  <img src="https://github.com/user-attachments/assets/cf23c187-44a5-49f8-8bf5-2f0c1a8b64f4" width="500" height="auto"><br/>
  <span style="display: inline-block" align="center">콘텐츠 이동중일때 실시간으로 콘텐츠들의 위치들을 표시해 줍니다.</span>
</p>

<hr/>

### 5. 사용자는 기다림을 좋아하지 않습니다.

> 변경하여 저장한 DOM 요소를 저장 방식에 따라 효율적인 저장과 속도 성능 향상 측면에서 개선되어진 저장 방식의 변화 수순으로 나열 합니다. <br/><br/>
> DOM 요소 저장 방식 변화 <br/>`배열 저장 > 스냅샷 저장 & 용량에 따른 GridFS 혼합방식 저장`<br/>

#### a. 동작한다고 표시해 봅시다. <br/>

기획 의도 :<br/>
&nbsp;&nbsp; 웹 사이트에 저장된 정보를 출력 할 동안 DOM 요소의 양에 따라 소요 시간이 발생하여 이는 사용자에게 로딩표시가 필요하다고 판단 하였습니다.

구체화 : <br/>
&nbsp;&nbsp; 저장과 동시에 저장된 DOM 요소가 리스트로 조회가 됩니다. 현재 커스텀 링크 스위칭과 커스텀 링크 스위칭을 클릭하여 출력되는 조회에서 새로 변경된 DOM 요소를 불러오는 동안 사용자에게 로딩을 보여주고, 삭제를 할 경우에도 로딩이 필요하면 보여집니다.

방안 적용 및 결과 : <br/>
&nbsp;&nbsp; DOM 요소 처리 진행에 따라 로딩 표시를 보여줌으로 사용자의 불편 사항을 개선 하였습니다.

개선점 : <br/>
&nbsp;&nbsp; DOM 요소의 용량 및 갯수에 따라 로딩 소요 시간이 증가 하는 경우를 고려하여 DOM 요소 자체의 용량을 가볍게 다루는 부분이 필요하다고 판단 하였습니다.

#### b. 대용량을 가볍게 다뤄봅시다. <br/>

기획 의도 :<br/>
&nbsp;&nbsp; 기존의 기능 구현 방식으로 웹사이트에서 DOM이 로드되고 난후 사용자가 콘텐츠를 변경하게되면, DOM의 위치 또한 바뀌게 되기에 DOM을 전체 저장하는 방식으로 구현하여, 하나의 DOM 요소들을 각 배열에 담아 데이터베이스에 저장하여 경우에 따라 웹 페이지의 DOM 요소가 대용량으로 저장되기도 하여 가벼운 저장 방식을 자료 조사하여 기획 하였습니다. <br/>

구체화 :<br/>
&nbsp;&nbsp; 웹 사이트마다 DOM의 길이에 따른 용량이 다양하여 저장되는 속도와 저장된 DOM 요소를 조회하는 속도의 반응이 제각각으로 확인되어 이에 따라 일부의 웹 페이지의 경우 DOM 요소가 로딩 시간이 장시간 소요되어 멈춰있는 듯한 현상으로 사용자의 PC환경에 부담을 주는 경우가 발생 하였습니다.

<br/>
  <p align="center">
    <img src="https://github.com/user-attachments/assets/085f4aab-40f1-4530-9674-4cc4cfd2103a" width="700" height="auto"> <br/>
    <span style="display: inline-block" align="center">한 웹 사이트의 DOM 요소 전체 저장시의 2000개 이상의 많은 저장값.</span>
  </p>

방안 적용 및 결과 : <br/>

- **[GridFS 저장 방식](https://www.mongodb.com/ko-kr/docs/manual/core/gridfs/)** <span style="font-size: 80%"><a href="#6-%EC%A0%80%EC%9E%A5%ED%95%9C-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8%EA%B0%80-%EB%A6%AC%EB%89%B4%EC%96%BC%EB%90%98%EC%96%B4%EB%8F%84-%EB%B0%98%EC%98%81-%ED%95%98%EA%B3%A0%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4">[ 6. 저장한 웹사이트가 리뉴얼되어도 반영 하고싶습니다. ] 과 연계</a></span><br/>
  &nbsp;&nbsp; MongoDB의 메소드에서 BSON은 데이터를 압축하여 저장합니다.<br/>
  웹 페이지 마다 DOM의 용량은 다양합니다. GridFS는 데이터의 용량이 16GB 이상일 경우에 고유 ID로 데이터를 변환시켜 데이터베이스에 저장하고 16GB 이하의 데이터일 경우에 불필요한 변환 작업없이 저장 되는 방식으로 작업이 진행됩니다.

  이와 함께 DOM요소를 데이터베이스로 전달해줄 때 스냅샷을 활용하여 기존에 배열로 전달할 때 보다 경량화된 DOM요소를 전달 가능하게 구현하였습니다.
  <br/>

<hr/>

### 6. 저장한 웹사이트가 리뉴얼되어도 반영 하고싶습니다.

> 웹 사이트가 리뉴얼이 일어나 요소들의 추가 및 삭제, 개선되는 부분으로 인하여 현재 시점의 콘텐츠 구성과 저장했던 과거 시점의 콘텐츠 구성에 차이가 발생해도 콘텐츠 구성을 유지할 수 있을지 생각이 들었습니다.
>
> 기존에 사용자가 저장했던 콘텐츠 구성은 과거 시점 기준으로 저장한 것이기에, 리뉴얼된 콘텐츠 구성과 전혀 달라져버리는 경우도 있을거라 생각했고, 그렇다면 사용자는 저장 했던 콘텐츠 구성을 사용하지 못해 다시 새로 변경하고 저장하는 불필요한 작업이 사용자에게 요구되는 경우가 발생합니다.

기획 의도 :<br/>
&nbsp;&nbsp; 사용자가 직접 변경한 DOM 요소만 저장하고 조회하여 웹 페이지 화면에 출력을 하며, 출력시에는 변경했던 DOM 요소의 위치에 적용합니다. <br/>
DOM 요소의 위치는 현제 웹 페이지의 전체 DOM과 저장한 전체 DOM 요소에 각각 고유 id를 전부 적용하고 그 id와 일치한 DOM 요소에 저장된 DOM 요소를 적용합니다. <br/>
저장한 DOM 요소에 해당하는 id가 있으나 현재 DOM 요소에는 해당하는 id가 없을경우 웹 페이지에 리뉴얼 등이 발생한것으로 간주하여, 사용자에게 팝업으로 다시 새로 저장하도록 합니다.

구체화 : <br/>
&nbsp;&nbsp; modifiedDOMSnapshot의 이름으로 변경된 DOM 요소를 포함한 전체 DOM을 스냅샷으로 저장하며 DOM 요소마다 각각의 id를 부여하고 현재 DOM이 웹 페이지 화면에 출력된후 익스텐션 아이콘(Toolbar button)을 클릭하게되면 현재 DOM 요소에 각각 고유 id를 부여합니다. 사용자가 변경한 DOM 요소를 변경한 갯수 별로 elementChanges의 이름에 저장합니다.

- 현재 DOM과 저장된 DOM은 같은 id를 각 요소마다 기본적으로 가집니다.
- 그 두개의 DOM을 비교 알고리즘으로 비교합니다.
- 만약 다른 id를 가진 DOM 요소를 찾을 경우, 저장된 데이터베이스의 정보에서 elementChanges의 데이터를 가져옵니다.
- elementChanges 데이터에는 각각의 DOM 요소를 사용자가 변경하기전의 원본 DOM 요소의 위치값을 가진 속성과, 변경된 DOM 요소의 새로운 위치값을 가진 속성이 있습니다.
- 다른 id를 가진 DOM 요소를 찾아서 그 위치의 현재 DOM 요소에 elementChanges의 원본 DOM 요소의 속성을 비교하고, 같은 속성일 경우 변경된 DOM 요소의 속성을 적용합니다.<br/>

방안 적용 및 결과 : <br/>
&nbsp;&nbsp; elementChanges가 가진 원본 DOM과 변경된 DOM의 각각의 위치 정보는 Xpath 메소드를 적용하고, 이정보를 저장할때 스타일 요소도 같이 저장하여 변경된 정보를 웹 페이지에 출력할때 스타일까지 적용합니다. <br/>

개선점 : <br/>
&nbsp;&nbsp; CSS 스타일이 모두 가져와 지지않은 상태에서 저장되고 웹 페이지 화면에 제대로 출력되지 않는 경우가 발생하는 부분이 있습니다. 브라우저의 개발자 도구에서 마지막 요소를 참조하는 단축키인 $0 변수를 Xpath로 변환하고 저장하는 방법이 있으며, CSS 스타일에서 두가지의 메소드를 추가적으로 자료 조사하여 웹 페이지 화면에서 출력된 상태의 DOM의 CSS 스타일을 가진 요소를 Xpath에 추가적으로 저장 하는 방안으로 개선이 가능합니다.

<!-- Element.style 속성 참조
getComputedStyle() 메소드 -->

<hr/>

## 프로젝트 회고

&nbsp;&nbsp; 시간 절약을 선호하여 평소에 인터넷 쇼핑을 즐겨하여 자주 방문하는 특정 웹 사이트에서 주로 클릭하는 카테고리 영역이 있으나, 항상 스크롤해서 찾아가는 위치까지의 품이들어 시간이 아깝고 불편하다고 생각하여 웹 사이트를 내가 원하는 형식으로 바꿔보고 싶은 아이디어에서 시작하였습니다. <br/><br/>
&nbsp;&nbsp; 모든 웹 사이트의 DOM 요소를 조작하는 아이디어 이기에 크롬 익스텐션 개발이 적합하다고 판단 하였고 익스텐션 개발에 대해서는 처음 접하기에, 익스텐션의 정책 및 아키텍쳐를 고려하면서 이해하는 과정이 필수적인 요소이며, 크롬 브라우저에 탑재된 V8엔진이 Javascript에 최적화 되어있어 성능적인 측면에서 이점을 누릴 수있고 이런 부분을 종합적으로 고려하여 Javascript를 선택하였습니다.<br/>

&nbsp;&nbsp; 프로젝트를 진행하면서 DOM의 특정 요소를 저장하는 기능과 DOM전체를 스냅샷으로 저장하는 기능을 로직으로 구현하는 방법을 자료 조사하고, 검증하면서 React의 비교알고리즘의 재조정(Reconciliation)과 Virtual dom의 동작원리에 대해서 조금 더 이해하게 되어 Javascript를 React로 마이그레이션 했을 때 익스텐션 개발을 하기전보다는 React에 대한 이해가 깊어 졌다고 생각합니다.
