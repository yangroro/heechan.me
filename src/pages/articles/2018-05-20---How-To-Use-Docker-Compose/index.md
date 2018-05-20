---
title: Docker Compose로 멀티 컨테이너 Docker 어플리케이션 만들기
date: "2018-05-20"
layout: post
draft: false
path: "/posts/how-to-use-docker-compose/"
category: "Development"
tags:
  - "Docker"
  - "DevOps"
  - "Development"
description: "Docker 어플리케이션을 Docker Compose로 정의해 파일로 관리할 수 있게 하고 손쉽게 멀티 컨테이너 어플리케이션으로 만들어보자"
---

![docker-compose](./images/docker-compose.png)

 지난번 [글(Docker 사용방법 둘러보기)](https://heechan.me/posts/how-to-use-docker/)에서 간단한 URL 기반의 조회수 어플리케이션을 Node JS와 Redis로 만들었다. 지난 글에서 Node JS 어플리케이션을 실행시키기 위해서 다음과 같은 명령어를 사용해야 했다. 

`docker run -p 8080:8080 --env REDIS_URL=redis://heechan-macbook-13.local mydocker:latest` 

사용할 포트를 정의하고 환경변수를 넣었는데 겨우 2가지 조건이 설정된 간단한 어플리케이션을 사용하기 위해서 위 명령어를 쳐야한다고 생각해보자. 거기에 그걸 팀원과 공유해야한다면? 변경 사항이 생길때마다 지옥에 빠질 것이다.

 Docker는 이에 대한 답도 제시해놨다. 바로 [Docker Compose](https://docs.docker.com/compose/)이다. 이번에도 내가 좋아하는 정의를 찾아보면 Docker Compose 소개 페이지에서는 이렇게 얘기하고 있다. 

> a tool for defining and running multi-container Docker applications

 Docker compose는 Docker 어플리케이션을 정의하고 멀티 컨테이너 어플리케이션을 실행시키기 위한 도구이다. Docker compose를 이용하면 앞서 소개한 Docker 실행환경등에 대한 정의를 파일로 만들어 관리하고 여러개의 컨테이너를 1번의 명령으로 실행 시킬 수 있다. Mac 환경에서 Docker for Mac이나 Docker Toolbox를 사용한다면 이 2개를 설치할때 함께 설치되었으니 따로 설치할 필요는 없고 바로 사용할 수 있다.

## 이제 docker-compose.yml을 작성해보자

Docker Compose 정의는 YAML 파일 형식으로 작성하는데 기본 파일명은 docker-compose.yml이다. 이제 이 파일로 지난 글에서 만들었던 조회수 어플리케이션을 정의해보자.

```yaml
# 사용할 Docker compose 문법의 버전을 정의한다. 
# 특정 버전 이상에서만 사용할 수 있는 옵션이나 
# deprecate되는 옵션들이 있기 때문에 필요한 버전을 잘 정의해야 한다.
version: "3"
services:
  # 실행할 컨테이너 이름을 정의한다. 
  view-counter:
    # 사용할 이미지 이름과 태그를 정의한다. 
    # 빌드시에 여기에 명시한 이미지 이름과 태그가 빌드된 이미지에 붙게 된다.
    image: view-counter:latest
    # 빌드 옵션을 지정한다.
    build:
      # Build시에 현재 디렉토리를 사용한다는 내용이다.
      context: .
    # 호스트 포트와 컨테이너 포트를 어떻게 연결할지 정의한다.
    ports:
      - "8080:8080"
    # 환경변수 리스트를 정의한다. 
    environment:
      REDIS_URL: "redis://heechan-macbook-13.local"
```

이 docker-compose.yml에는  `docker build . -t view-counter:latest` 이미지 빌드 명령어와  `docker run -p 8080:8080 --env REDIS_URL=redis://heechan-macbook-13.local mydocker:latest`  컨테이너 실행 명령어를 사용할때 사용한 옵션들을 정의했다. (물론 컨테이너 이름을 지정하는 등 약간의 차이는 존재한다.) 이제 docker-compose로 컨테이너를 실행시켜보자. 

```bash
$ docker-compose up
Creating network "docker-compose-example_default" with the default driver
Building view-counter
Step 1/9 : FROM node:9.11
9.11: Pulling from library/node
3d77ce4481b1: Pull complete
534514c83d69: Pull complete
d562b1c3ac3f: Pull complete
4b85e68dc01d: Pull complete
f6a66c5de9db: Pull complete
7a4e7d9a081d: Pull complete
b623744d592a: Pull complete
37e16127669d: Pull complete
Digest: sha256:ca805c44369c53ece95248beace81ba627fd0b13c0e75cfe7f6694144c60bc7c
Status: Downloaded newer image for node:9.11
 ---> d42348c94e97
Step 2/9 : ENV REDIS_URL="redis://heechan.local"
 ---> Running in 1d47e07dd858
Removing intermediate container 1d47e07dd858
 ---> 97873862a2c2
Step 3/9 : WORKDIR app
Removing intermediate container f4d6da10a2a7
 ---> 9d566502d25f
Step 4/9 : COPY ./package.json package.json
 ---> 989202879c2f
Step 5/9 : COPY ./yarn.lock yarn.lock
 ---> ae1b730d2179
Step 6/9 : RUN yarn install
 ---> Running in d7c22755be27
yarn install v1.5.1
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 0.45s.
Removing intermediate container d7c22755be27
 ---> 0649e06d0e84
Step 7/9 : COPY ./index.js index.js
 ---> c11158de8600
Step 8/9 : ENTRYPOINT ["node"]
 ---> Running in a08a20e99393
Removing intermediate container a08a20e99393
 ---> 619244769f5e
Step 9/9 : CMD ["index.js"]
 ---> Running in 6759e16c9114
Removing intermediate container 6759e16c9114
 ---> 16b2a157cffc
Successfully built 16b2a157cffc
Successfully tagged view-counter:latest
WARNING: Image for service view-counter was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
Creating docker-compose-example_view-counter_1 ... done
Attaching to docker-compose-example_view-counter_1
view-counter_1  | start server
view-counter_1  | start to connect redis: redis://heechan-macbook-13.local
```

`docker-compose up` 으로 컨테이너를 실행시켰다. `docker-compose.yml`에 정의된 이미지가 없거나 `--build` 옵션을 사용한 경우 `build` 항목을 참조하여 이미지를 빌드하여 사용한다. 이제 매번 명령어를 사용하여 docker 실행 환경을 정의할 필요가 없어졌다. 

## Redis도 컨테이너로 사용하기

작성한 `docker-compose.yml`에 Redis 컨테이너를 추가해보자. 이제 호스트 머신에 설치된 Redis를 사용하는 대신에 컨테이너 레디스를 사용할 것이다. [Redis 이미지](https://hub.docker.com/_/redis/)는 Docker Hub에 올라가 있으니 그것을 사용한다. Docker Hub를 보면 redis 설정을 위한 다양한 옵션들이 있으니 기본 설정이 아닌 다른 설정을 사용하고자 한다면 Docker Hub를 참조하여 옵션을 설정하면 된다.

```yaml
version: "3"
services:
  app:
    image: docker-example:latest
    build:
      context: .
    ports:
      - "8080:8080"
    links:
      - redis
    environment:
      REDIS_URL: "redis://redis"
  redis:
    # hostname을 정의한다. 따로 작성하지 않으면 service 이름과 같은 이름을 사용한다.
    hostname: redis
    image: redis:latest
```

이제 다시 `docker-compose up`을 해보자. 

```shell
$ docker-compose up
Creating network "docker-compose-example_default" with the default driver
Creating docker-compose-example_redis_1        ... done
Creating docker-compose-example_view-counter_1 ... done
Attaching to docker-compose-example_redis_1, docker-compose-example_view-counter_1
redis_1         | 1:C 20 May 07:26:15.378 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis_1         | 1:C 20 May 07:26:15.378 # Redis version=4.0.9, bits=64, commit=00000000, modified=0, pid=1, just started
redis_1         | 1:M 20 May 07:26:15.380 * Ready to accept connections
view-counter_1  | start server
view-counter_1  | start to connect redis: redis://redis
```

 아주 손쉽게 로컬에 있는 Redis 대신에 Redis 컨테이너를 띄웠다. 이제 호스트에 Redis를 깔지 않고도 이 어플리케이션에서 Redis를 사용할 수 있게 되었다. 

## Docker Compose로 할 수 있는 일

위에서 소개한 기능들은 Docker Compose의 기능중 아주 기본적인 기능 몇가지만을 소개했다. 이 외에도 Docker Compose로 아주 다양한 일을 할 수 있는데 이는 [Docker Compose compose-file](https://docs.docker.com/compose/compose-file/#service-configuration-reference)항목을 천천히 읽어 보는 것을 추천한다. 그리고 작성한 Docker Compose를 이용해서 다른 서비스에도 응용 가능하다. 대표적인 예로 들 수 있는 것이 AWS의 [Elastic Container Service](https://aws.amazon.com/ecs/)이다. ECS에서는 컨테이너 어플리케이션을 배포하기 위해서 [ECS Task Definition](https://docs.aws.amazon.com/ko_kr/AWSCloudFormation/latest/UserGuide/aws-resource-ecs-taskdefinition.html)이라는 것을 작성해야 한다. ECS Task Definition은 `docker-compose.yml`처럼 어플리케이션의 설정등을 정의하는 파일인데 이것을 `docker-compose.yml`을 이용하여 변환하는 기능등을 제공한다. 물론 모든 기능이 1대1로 사용 가능한 것은 아니지만 AWS와 로컬 개발환경에서 거의 같은 설정을 이용 가능하다는 장점이 있다.



다음 글에서는 AWS ECS를 통해 컨테이너 어플리케이션을 배포 하는 것을 다뤄보겠다. 



