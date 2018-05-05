---
title: PHPDBG를 이용해서 PHPUnit Code Coverage 커버리지 측정 시간 단축하기
date: "2018-05-05T19:46:37.121Z"
layout: post
draft: false
path: "/posts/shorten-phpunit-code-coverage-excution-time/"
category: "Development"
tags:
  - "PHP"
  - "Test"
  - "Development"
description: "phpunit-code-coverage으로 인해 느려진 테스트 실행 시간을 단축해보자"
---

8percent의 [코드 커버리지 80% 넘긴 썰(8percent)](https://brunch.co.kr/@leehosung/43) 이 글을 읽고 나서 오픈소스도 아닌 회사 프로젝트가 코드 커버리지 80%를 넘겼다는 이야기와 함께 `어떻게 코드 커버리지를 80%에 도달하게 되었는가?` 라는 과정이 인상적이었다. 그래서 코드 커버리지 측정을 도입했고 그 과정에서 있었던 작은 삽질을 소개하고자 한다. 

## 코드 커버리지 측정

기존 테스팅 프레임워크로는 PHPUnit을 사용 중이었으므로 [PHPUnit에서 권장](https://phpunit.de/manual/6.5/en/code-coverage-analysis.html)하는 [php-code-coverage](https://github.com/sebastianbergmann/php-code-coverage)를 사용하였다. (php-code-coverage는 xdebug에 의존성이 있다. 즉 테스트가 돌아가는 환경에 xdebug도 필요하다.)

```shell
$ composer install --require-dev phpunit/php-code-coverage
```

이제 기존에 PHPUnit 테스트를 가지고 있는 프로젝트에서 테스트 커버리지와 함께 테스팅을 돌려보자. 

```sh
$ vendor/bin/phpunit --coverage-text --coverage-html
PHPUnit 6.5.6 by Sebastian Bergmann and contributors.

.................SSSSSS........................................  63 / 180 ( 35%)
....................................S.......................... 126 / 180 ( 70%)
......................................................          180 / 180 (100%)

Time: 9.24 minutes, Memory: 60.00MB

Generating code coverage report in HTML format ... done
```



이제 커버리지 측정 완료.... 그런데 전체 테스트 시간이 기존 2~3분에서 약 9분으로 증가했다.

![이래선 사용할 수가 없다](https://media.giphy.com/media/3oEjHZ02R5YhUNFcjK/giphy.gif)

## 원인! 원인을 찾자!

커버리지 측정을 하고 리포트를 생성하는 일이 그렇게까지 오래 걸리는 일인가?라는 질문을 가지고 알아본 결과 나만 그런 것이 아니었다. 다른 사람들이 제시한 해결책으로 phpdbg를 사용하는 방법이 있었다. 

[phpunit과 phpdbg로 커버리지 리포트 생성하기](https://hackernoon.com/generating-code-coverage-with-phpunite-and-phpdbg-4d20347ffb45)

내 사례와 같이 phpunit-code-coverage 사용 이후 테스트 속도가 매우 느려졌고 Xdebug 대신 phpdbg를 사용하여 속도를 개선했다는 내용이다. 글에서는 phpdbg를 사용할 때와 Xdebug를 사용할 때 코드 커버리지 리포트가 완전히 같지 않다는 문제를 소개하지만 작은 오차이고 오차없는 코드 커버리지 수치를 얻는게 목적이 아니기 때문에 phpdbg를 사용했다.

brew를 이용해서 맥에서 php와 함께 phpdbg를 설치 할 수 있다. (우분투의 경우 저장소에서 제공한다. [ubuntu package](https://packages.ubuntu.com/xenial/amd64/php7.0-phpdbg))

```shell
$ brew install php70 --with-phpdbg
```

사용하는 phpdbg 옵션을 간단히 설명하면 -q는 phpdbg 배너 출력을 하지 않게 하고 -rr 옵션은 실행 후에 phpdbg를 종료시키는 옵션이다. 

```shell
$ phpdbg -qrr vendor/bin/phpunit --coverage-text --coverage-html=coverage
PHPUnit 6.5.7 by Sebastian Bergmann and contributors.

..................SSSSSS.......................................  63 / 166 ( 37%)
............................................................... 126 / 166 ( 75%)
........................................                        166 / 166 (100%)

Time: 3.48 minutes, Memory: 1306.00MB

Generating code coverage report in HTML format ... done
```

테스트 시간이 종래의 9분에서 3분 30초 정도로 줄어들었다. 그런데 메모리 사용량이 증가했다! 사실 이 화면을 보기 전에 PHP memory exhausted error가 발생해서 메모리 사용량 제한을 증가시켜줘야 했다. 추가로 조사해보니 phpdbg를 사용하는 경우 테스트에서 `Tester\CodeCoverage\Collector::flush()`를 호출해 직접 메모리를 비워줘야 한다고 한다. 

## 더 빠르게

커버리지 측정을 도입하면서 전체 테스팅과 CI에 소요되는 전체 시간을 줄이기 위한 몇 가지 노력을 더 했고 이를 소개한다.

1. 패키지 설치 스크립트 최소화

   이건 PHPUnit에 관련된 것은 아닌 것이지만 CI를 사용하고 있다면 한번 살펴보면 좋을 부분이다. 기존에 CI에서 php docker 이미지에 추가로 사용하고 있는 패키지를 설치하는 과정이 있었는데 이걸 미리 해둔 [docker hub에 image](https://hub.docker.com/r/ridibooks/store-php-test/)를 빌드해서 올렸다. 이로써 매 테스트마다 패키지를 설치하느라 소요되는 시간이 없어졌다.

2. 느린 Test 찾아내기

   전체 테스트 과정에서 실행하는데 오래 걸리는 테스트를 찾아냈다. 이는 [phpunit-speedtrap](https://github.com/johnkary/phpunit-speedtrap)이라는 라이브러리를 사용하여 느린 테스트를 찾았다. 이를 이용해서 과도하게 오래 걸리는 테스트를 찾아내고 최적화하거나 불필요한 것들을 없앴다.

3. Parallel Testing

   기본적으로 PHPUnit은 테스트를 순차 실행한다. 순차 실행으로 생기는 속도 저하를 병렬 실행을 통해 개선할 수 있게 도와주는 extension도 존재한다. 몇 가지 extension이 있지만 [phpunit extension 페이지](https://phpunit.de/extensions.html)에서 소개한 [paratest](https://github.com/paratestphp/paratest)를 사용했다. ~~(그리고 내가 [기여](https://github.com/paratestphp/paratest/pull/308)도 했다)~~

## 결론

![](https://media.giphy.com/media/3NtY188QaxDdC/giphy.gif)

코드 커버리지 리포트를 얻었고 전체 CI 시간은 종전보다 더 빨라졌다. 커버리지 측정을 적용하면서 느려진 부분은 phpdbg로 실행 시간을 단축하고 그 외에 `패키지 설치 스크립트 최소화`, `느린 Test 찾아내기`, `Parallel Testing` 등을 도입해 전체 CI 시간을 기존보다 약간 단축하는데 성공했다.

### TL; DR

php-code-coverage사용시 속도가 너무 느리다면 phpdbg 사용을 시도해볼만 하다.
