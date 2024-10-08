# LayerTune

<p align="center">
  <img src="https://github.com/user-attachments/assets/dfcaba5a-4713-4fed-a770-ab5ca2febd26">
</p>

<p align="center">
웹 사이트에서 각 영역을 사용자가 원하는 위치로 변경 할 수 있도록 돕는 Chrome Extension입니다. <br/>
웹 사이트 페이지의 주요 영역들을 시각적으로 한눈에 확인 가능하고, <br/> 
사용자는 간단한 단축키를 통해 drag and drop으로 영역을 변경하여 나만의 사이트 구성을 보관 할 수 있습니다.
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
  - [2. 버튼하나로 영역 가동](#2-%EB%B2%84%ED%8A%BC%ED%95%98%EB%82%98%EB%A1%9C-%EC%98%81%EC%97%AD-%EA%B0%80%EB%8F%99)
  - [3. 이건 요기, 저건 쩌~어기로](#3-%EC%9D%B4%EA%B1%B4-%EC%9A%94%EA%B8%B0-%EC%A0%80%EA%B1%B4-%EC%A9%8C%EC%96%B4%EA%B8%B0%EB%A1%9C)
  - [4. 이제 이건 나만의 것](#4-%EC%9D%B4%EC%A0%9C-%EC%9D%B4%EA%B1%B4-%EB%82%98%EB%A7%8C%EC%9D%98-%EA%B2%83)
- [흐름에 따른 사고](#%ED%9D%90%EB%A6%84%EC%97%90-%EB%94%B0%EB%A5%B8-%EC%82%AC%EA%B3%A0)
  - [1. 모든 사이트에 많은 영역을 가동 시키고 싶습니다.](#1-%EB%AA%A8%EB%93%A0-%EC%82%AC%EC%9D%B4%ED%8A%B8%EC%97%90-%EB%A7%8E%EC%9D%80-%EC%98%81%EC%97%AD%EC%9D%84-%EA%B0%80%EB%8F%99-%EC%8B%9C%ED%82%A4%EA%B3%A0-%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4)
  - [2. 공든 탑이 무너졌습니다.](#2-%EA%B3%B5%EB%93%A0-%ED%83%91%EC%9D%B4-%EB%AC%B4%EB%84%88%EC%A1%8C%EC%8A%B5%EB%8B%88%EB%8B%A4)
  - [3. 나는 구글로 로그인을 하고싶습니다.](#3-%EB%82%98%EB%8A%94-%EA%B5%AC%EA%B8%80%EB%A1%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8%EC%9D%84-%ED%95%98%EA%B3%A0%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4)
  - [4. 단축키, 한번의 스위칭으로 두개 이상을 다뤄 봅시다.](#4-%EB%8B%A8%EC%B6%95%ED%82%A4-%ED%95%9C%EB%B2%88%EC%9D%98-%EC%8A%A4%EC%9C%84%EC%B9%AD%EC%9C%BC%EB%A1%9C-%EB%91%90%EA%B0%9C-%EC%9D%B4%EC%83%81%EC%9D%84-%EB%8B%A4%EB%A4%84-%EB%B4%85%EC%8B%9C%EB%8B%A4)
  - [5. 사용자는 로딩을 좋아하지 않습니다.](#5-%EC%82%AC%EC%9A%A9%EC%9E%90%EB%8A%94-%EB%A1%9C%EB%94%A9%EC%9D%84-%EC%A2%8B%EC%95%84%ED%95%98%EC%A7%80-%EC%95%8A%EC%8A%B5%EB%8B%88%EB%8B%A4)
    - [a. 대용량을 가볍게 다뤄봅시다.](#a-%EB%8C%80%EC%9A%A9%EB%9F%89%EC%9D%84-%EA%B0%80%EB%B3%8D%EA%B2%8C-%EB%8B%A4%EB%A4%84%EB%B4%85%EC%8B%9C%EB%8B%A4-)
    - [b. 동작한다고 표시해 봅시다.](#b-%EB%8F%99%EC%9E%91%ED%95%9C%EB%8B%A4%EA%B3%A0-%ED%91%9C%EC%8B%9C%ED%95%B4-%EB%B4%85%EC%8B%9C%EB%8B%A4-)
  - [6. 저장한 웹사이트가 리뉴얼되어도 반영 하고싶습니다.](#6-%EC%A0%80%EC%9E%A5%ED%95%9C-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8%EA%B0%80-%EB%A6%AC%EB%89%B4%EC%96%BC%EB%90%98%EC%96%B4%EB%8F%84-%EB%B0%98%EC%98%81-%ED%95%98%EA%B3%A0%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4)
- [프로젝트 회고](#%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%ED%9A%8C%EA%B3%A0)

<!-- tocstop -->

## LayerTune 흐름

### 1. 브라우저화면을 내맘대로

<details>
<summary>미리보기</summary>
<div markdown="1">
<img src=""  width="700" height="370">
</div>
</details>

### 2. 버튼하나로 영역 가동

<details>
<summary>미리보기</summary>
<div markdown="1">
<img src=""  width="700" height="370">
</div>
</details>

### 3. 이건 요기, 저건 쩌~어기로

<details>
<summary>미리보기</summary>
<div markdown="1">
<img src=""  width="700" height="370">
</div>
</details>

### 4. 이제 이건 나만의 것

<details>
<summary>미리보기</summary>
<div markdown="1">
<img src=""  width="700" height="370">
</div>
</details>

## 흐름에 따른 사고

> 개인 프로젝트 작업 진행에 따라 기획 단계에서 추상적으로 생각한 기능 명세서가 실제로 기능을 구현함에 있어 구체적인 사고가 가장 중요함을 인지합니다.<br/>
> 흐름에 따른 사고는 기본적으로 <b> `사고 인지 > 사고 방안 > 사고 실패 > 사고 보완 > 개선 및 성공` </b> 수순으로 나열 합니다.

### 1. 모든 사이트에 많은 영역을 가동 시키고 싶습니다.

첫 사고 및 방안 :<br/>
&nbsp;&nbsp; 화면을 보여주는 DOM에서 HTML의 여러 태그 중에 <b>div</b> 와 <b>Semantic Tag</b> 만 상수화로 지정하여 해당하는 부분만 웹사이트 화면에 영역을 활성화 시켜 사용자가 자유롭게 영역을 변경 가능하도록 의도 하였습니다. <br/><br/>
<img src="https://github.com/user-attachments/assets/e64ae8ff-cf44-47fa-af13-cd9c4aab82a6" width="auto" height="20" align="center"> <br/>
&nbsp;&nbsp;웹사이트 별로 DOM의 HTML형태가 다양한 부분을 간과하였으며, body 태그의 바로 아래 태그들만 접근이 가능하게 구현되었습니다. <br/> 그로 인해, 네이버 및 다음 웹사이트 등 레거시의 로직이 포함되어 유지보수된 웹사이트의 경우에는 body 태그 바로 아래의 자식요소가 하나가 아닌 하나 이상의 div 등의 태그로 인하여 웹사이트의 구조를 이루는 모든 태그들이 활성화 되지 못합니다.
<br/><br/>
두번째 사고 방안 : <br/>
&nbsp;&nbsp;DOM의 모든 태그를 인식 시킨후, 사용자가 원하는 영역 접근하는게 사용자 편의 및 익스텐션의 정의로 접근하여 사고 합니다.

<img src="https://github.com/user-attachments/assets/e564013c-3812-4544-ba79-2383b50d1f45" width="auto" height="20" align="center"> <br/>
&nbsp;&nbsp;DOM의 모든 요소들을 단축키 기능을 추가하여 단축키를 통한 영역 접근 및 선택으로 원하는 영역을 변경 가능하게 기능 개선을 하였습니다.
<br/>
<span style="font-size: 80%"><a href="#4-%EB%8B%A8%EC%B6%95%ED%82%A4-%ED%95%9C%EB%B2%88%EC%9D%98-%EC%8A%A4%EC%9C%84%EC%B9%AD%EC%9C%BC%EB%A1%9C-%EB%91%90%EA%B0%9C-%EC%9D%B4%EC%83%81%EC%9D%84-%EB%8B%A4%EB%A4%84-%EB%B4%85%EC%8B%9C%EB%8B%A4">[ 4. 단축키, 한번의 스위칭으로 두개 이상을 다뤄 봅시다. ] 과 연계</a></span>
<br/><br/>
보완 사항 <br/>
&nbsp;&nbsp;사용자 시점에서 고려 해야하는 부분은 대표적으로 두 가지로 사고 합니다.

1. 선택 가능한 영역에서 어디까지, ㄴ즉 Depth를 시각적으로 분리해서 사용자에게 표시해 줄것인가.
2. 활성화된 영역을 한눈에 보여주고, 사용자가 단축키로 하나씩 직접 해보지 않는한 미리 알기 어려움.<br/>

<img src="https://github.com/user-attachments/assets/81c2932e-4f2c-4b5e-9f6a-1b06fc6fd599" width="auto" height="20" align="center"> <br/>
&nbsp;&nbsp;변경 가능한 영역을 점선 표기로 초기 가이드라인 제공
<br/><br/>

  <p align="center">
    <img src="https://github.com/user-attachments/assets/6f7e7348-ae59-4247-8e4f-9c23d61ffca1" width="700" height="auto" >
  </p>

<hr/>

### 2. 공든 탑이 무너졌습니다.

첫 사고 및 방안 : <br/>
&nbsp;&nbsp; 영역 활성화 표시를 border 스타일로 지정 하여, 웹 사이트에서 영역 활성화 사용자 시각표시를 의도 하였습니다.

<img src="https://github.com/user-attachments/assets/e64ae8ff-cf44-47fa-af13-cd9c4aab82a6" width="auto" height="20" align="center"> <br/>
&nbsp;&nbsp;특정 웹 사이트에서 의도한 기능대로 영역 활성화가 되지만 다른 웹사이트를 테스트하는 가정에서 일부의 웹사이트(네이버, 다음)의 영역 활성화 시각적인 표현시 해당 웹사이트가 원래 가지고 있는 각 영역별 넓이의 값에 border의 넓이가 추가되어 그로 인한 영역 무너짐 현상이 발생 하였습니다.
<br/>

두번째 사고 방안 - 실패 원인 파악 : <br/>
&nbsp;&nbsp;border의 스타일 사용으로 양쪽 (왼쪽,오른쪽)에 각 1px씩 총 2px의 넓이가 웹사이트 영역에 새로 추가되는 경우로, 웹 사이트의 영역을 잡으면서 작업하는 방식에서 display: flex의 방식이 아닌 padding, margin으로 고정된 값을 통해 영역을 작업한 웹 사이트의 경우 작업된 웹 사이트의경우 익스텐션의 영역을 활성화 할때 밀림 현상이 발생하는 것으로 원인을 파악 하였습니다.<br/><br/>
<img src="https://github.com/user-attachments/assets/e564013c-3812-4544-ba79-2383b50d1f45" width="auto" height="20" align="center"> <br/>
&nbsp;&nbsp;border의 스타일로 작업된 부분을 outline으로 변경하여 웹 사이트마다의 영역 별 넓이의 스타일에 영향을 주지않는 것으로 확인 하였습니다.
<br/><br/>

<p align="center">
  <img src="https://github.com/user-attachments/assets/5f952487-8e55-461e-8523-6778a67a7def" width="auto" height="auto" >
</p>

<hr/>

### 3. 나는 구글로 로그인을 하고싶습니다.

첫 사고 및 방안 : <br/>
&nbsp;&nbsp; 크롬 및 익스텐션이 있는 PC에서 구글 계정을 통해서 사용자가 저장한 웹 사이트 구조로 이용 가능하기에, 익스텐션에 구글 로그인을 firebase auth로 제공해주는 사항을 확인하여 google Outh login 기능 구현을 정의 하였습니다.

<img src="https://github.com/user-attachments/assets/e64ae8ff-cf44-47fa-af13-cd9c4aab82a6" width="auto" height="20" align="center"> <br/>
&nbsp;&nbsp; 크롬 익스텐션에서 manifest.json에 firebase/auth/web-extension 선언하여 자유롭게 사용가능하다고 확인하였으나, Google Cloud 문서에서 <b>Chrome 확장 프로그램 사용자 로그인</b> 사용 기준에서 일부분의 사용에 있어서 유료로 확인되어 익스텐션 API를 우선순위로 사용하는 조건으로 정책상 다른 사용 가이드 확인이 필요하다고 판단 하였습니다.

두번째 사고 방안 : <br/>
&nbsp;&nbsp; google Cloud에서 google Outh에 대한 사용자 인증을 요청하기 위해, 클라이언트 ID를 Chrome 확장 프로그램으로 생성하고 extensions에서 개발자 모드로 확장 프로그램을 로드해놓은 프로젝트의 ID값을 클라이언트 ID와 연동을 하고 생성된 클라이언트 ID 정보를 mainfest.json의 oauth2에 정의하여 로그인 기능을 정의 합니다.

<img src="https://github.com/user-attachments/assets/e564013c-3812-4544-ba79-2383b50d1f45" width="auto" height="20" align="center"> <br/>
&nbsp;&nbsp; 익스텐션 아이콘 실행 후 로그인 버튼을 클릭하여 구글 계정 로그인 창을 확인하고, 그 창의 계속하기 클릭시 정상적으로 구글로그인되고, 로그인에 해당하는 googleID를 부여받습니다.

<img src="https://github.com/user-attachments/assets/81c2932e-4f2c-4b5e-9f6a-1b06fc6fd599" width="auto" height="20" align="center"> <br/>
&nbsp;&nbsp; manifest.json의 Outh 정의가 이루워지고, 필요에 따라 상태를 저장하고 사용할 token이 필요한 사항으로 현재는 popup.js에 token을 요청하는 로직이 있습니다. API관련 사항은 안정성 및 유지보수 측면의 개선점으로 별도의 API 파일로 관리하는게 좋은 방향이라 사고되어, 리팩토링 진행에 따라 별도로 분리하고 manifest.json과의 연결점이 유지되는 사항을 체크 해야합니다.

<hr/>

### 4. 단축키, 한번의 스위칭으로 두개 이상을 다뤄 봅시다.

<img src="https://github.com/user-attachments/assets/e64ae8ff-cf44-47fa-af13-cd9c4aab82a6" width="auto" height="20" align="center"> <br/>

- 기존의 기능은 한번에 하나의 영역선택 가능하고 이동중에 어디 영역까지 왔는지 사용자가 알 수 없어 사용자에게 불편함을 제공해 주었습니다.
- 다수의 영역을 동시에 하나의 구간에 이동 시키고 싶을 경우에 하나씩 이동해야하는 기존 기능으로 인하여 불필요한 작업과 시간이 요소되는 사용자 경험에 좋지 않다고 판단 하였습니다. <br/>

<img src="https://github.com/user-attachments/assets/81c2932e-4f2c-4b5e-9f6a-1b06fc6fd599" width="auto" height="20" align="center"> <br/> <br/>
&nbsp;&nbsp;통일성을 가진 단축키를 추가하여, 단일 선택으로 변경하는 경우와 다중 선택으로 한곳의 위치에 변경하는 방안으로 추가 기능을 구상하여 적용 하였습니다. <br/>

<img src="https://github.com/user-attachments/assets/e564013c-3812-4544-ba79-2383b50d1f45" width="auto" height="20" align="center"> <br/>

- 단일 선택 이동시 <b>마우스 (좌)</b> , 다중 선택시 <b>shift + control + 마우스 (좌)</b> 단축키를 통하여 선택하여 활성화된 표시를 시각적으로 표현해주었습니다. <br/>
- 선택한 영역의 위치를 이동 할 경우 <b>control + 마우스 (좌)</b> 끌기로 영역 변경이 일어나게 하였으며, 이동중에 어디의 영역에 놓아질지 실시간으로 시각적 표시를 추가하여 사용자에게 변경한 영역의 최종 위치를 안내 해주는 사용자 경험의 개선사항을 반영 하였습니다.

<p align="center">
  <img src="https://github.com/user-attachments/assets/3012ee6d-f9f2-4434-b395-5ee66a846331" width="700" height="auto">
</p>

<hr/>

### 5. 사용자는 로딩을 좋아하지 않습니다.

> 데이터 저장 값에 따라 어떻게 하면 효율적으로 저장하고, 속도 성능에서도 개선되는지에 대한 한번 이상의 사고를 통한 저장 방식의 변화 수순으로 나열 합니다. <br/><br/>
> 데이터 저장 방식 변화 <br/>`배열로 문자열 저장 > BSON 저장 > 스냅샷 저장 & 용량에 따른 GridFS 혼합방식 저장`<br/>

#### a. 대용량을 가볍게 다뤄봅시다. <br/>

- 첫 사고 및 방안 : <br/>
  &nbsp;&nbsp;웹사이트에서 DOM이 로드되고 난후 사용자가 영역을 변경하게되면, DOM의 위치또한 바뀌게 되기에 DOM을 전체 저장하는 방향으로 사고 하였으며, 하나의 DOM element를 각 배열에 담아 데이터베이스에 저장하였습니다. <br/><br/>
  <img src="https://github.com/user-attachments/assets/e64ae8ff-cf44-47fa-af13-cd9c4aab82a6" width="auto" height="20" align="center"> <br/>
  &nbsp;&nbsp; DOM의 데이터를 배열로 담을경우, 웹 사이트마다 DOM의 길이에 따른 용량이 다양하여 저장되는 속도와 데이터베이스에서 새로고침으로 랜딩 되는 시간에서 데이터 베이스의 멈춤현상이 발생합니다.

  <p align="center">
    <img src="https://github.com/user-attachments/assets/085f4aab-40f1-4530-9674-4cc4cfd2103a" width="700" height="auto">
  </p>

- 두번째 사고 방안 :<br/>
  &nbsp;&nbsp;MongoDB의 메소드에서 BSON으로 대용량의 데이터를 zip으로 압축하는 방식을 통하여, 데이터를 저장할때 BSON의 고유ID로 저장되고, 저장한 정보를 웹 사이트 화면에 출력할때에 압축한 고유 ID를 JSON으로 변환하여 보여주는것 방안으로 빠른 저장 및 빠른 조회를 제공하여 사용자에게 성능개선을 제공하기 위해 기능을 개선하기로 합니다. <br/>
  <br/>
  <img src="https://github.com/user-attachments/assets/e64ae8ff-cf44-47fa-af13-cd9c4aab82a6" width="auto" height="20" align="center"> <br/>
  &nbsp;&nbsp; 저장 정보를 조회할때, 조회 정보 중 원하는 리스트를 클릭하면, BSON으로 압축한 데이터는 압축 해제되어 웹 사이트에 출력되는 사항이지만, 고유ID가 압축 해제 되는 과정의 속도가 느리며, 웹 사이트에 출력 할 경우 DOM 전체에 지정해놓은 고유ID 값만을 찾아서 변경해주는 형태로 저장 당시의 DOM의 텍스트정보가 보여지는 현상이 발생합니다.
  <p align="center">
    <img src="https://github.com/user-attachments/assets/3abef707-cf82-4ac4-b47c-2be9c3d483db" width="700" height="auto">
  </p>

- 세번째 사고 방안 : <span style="font-size: 80%"><a href="#6-%EC%A0%80%EC%9E%A5%ED%95%9C-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8%EA%B0%80-%EB%A6%AC%EB%89%B4%EC%96%BC%EB%90%98%EC%96%B4%EB%8F%84-%EB%B0%98%EC%98%81-%ED%95%98%EA%B3%A0%EC%8B%B6%EC%8A%B5%EB%8B%88%EB%8B%A4">[ 6. 저장한 웹사이트가 리뉴얼되어도 반영 하고싶습니다. ] 과 연계</a></span>
  <br/>
  &nbsp;&nbsp; 기존의 BSON은 무조건 데이터를 압축하는 형태라면, GridFS는 데이터의 용량이 16기가 이상일 경우에 고유 ID로 데이터를 변환시켜 데이터베이스에 저장하는 메소드 입니다. GridFS를 혼합하는 저장 방식을 택한 사항은 웹 사이트에서도 작을 경우와 클경우가 다양하기에, 작을 경우 데이터를 변환하는 것은 불필요한 기능으로 사고하여, 16기가에 대한 기준을 잡아 다루기로 판단 합니다. <br/><br/>
  &nbsp;&nbsp;

  <br/><br/>
  <img src="https://github.com/user-attachments/assets/e564013c-3812-4544-ba79-2383b50d1f45" width="auto" height="20" align="center"> <br/>

#### b. 동작한다고 표시해 봅시다. <br/>

- 첫 사고 및 방안 : <br/>
  &nbsp;&nbsp;

  <img src="https://github.com/user-attachments/assets/e564013c-3812-4544-ba79-2383b50d1f45" width="auto" height="20" align="center"> <br/>

  <img src="https://github.com/user-attachments/assets/81c2932e-4f2c-4b5e-9f6a-1b06fc6fd599" width="auto" height="20" align="center"> <br/>

<hr/>

### 6. 저장한 웹사이트가 리뉴얼되어도 반영 하고싶습니다.

> 웹 사이트의 현재 시점의 영역 구성과 저장한 과거날짜 시점의 영역 구성이 달라지게 되었다면, <br/> 그때마다 사용자는 저장한 했던 웹 사이트를 다시 변경하고 저장하는 사용자 측면에서 불편한 부분이 발생합니다.

<hr/>

## 프로젝트 회고

