---
layout:     post
title:      测试总测试服
subtitle:   各种代码测试，敬请期待！！！
date:       2023-05-06
author:     余心留白
header-img: img/the-first.png
catalog: false
tags:
    - 通知公告
---

测试测试测试测试

<div style="text-align: center;">
  <p id="konami-text">揭开衣裳见证真容，嘻嘻，急急如律令！！！</p>
  <div id="hidden-content" style="display:none;">
    <p>愚蠢的地球人，你在想什么桃子啊？？？</p>
    <h1 style="text-align: center;"></h1>
    <img src="https://bnz07pap001files.storage.live.com/y4myLUOcjaMqlWu5Xjri49ETQ8b5ifyCtfx38X3q-JN9xQKB94A1XXxPImleMdAjrfwF951DYAfKLzpHK9ANOoQXFURVTPltj-0mj2ePh1kOVDhG1crwOaFnBiRURikaR8URkRQR_gA9KJVZvNs6vJ9TCjxKcRf6lz0AnYxjcX0Dxvhe0X_xuNVQx4Jl9_eJFao?width=1080&height=1350&cropmode=none" width="600" height="750" alt="2023-05-06-1" id="my-photo">
  </div>
</div>

<script>
  let touchStartX, touchEndX;
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];
  const hiddenContent = document.getElementById('hidden-content');
  const konamiText = document.getElementById('konami-text');
  const myPhoto = document.getElementById('my-photo');

  document.addEventListener('keydown', function(event) {
    if (event.code === konamiCode[keysPressed.length]) {
      keysPressed.push(event.code);
    } else {
      keysPressed = [];
    }
    if (keysPressed.length === konamiCode.length) {
      if (hiddenContent.style.display === 'none') {
        hiddenContent.style.display = 'block';
        konamiText.style.display = 'none';
      } else {
        hiddenContent.style.display = 'none';
        konamiText.style.display = 'block';
      }
      keysPressed = [];
    }
  });

  myPhoto.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].clientX;
  });

  myPhoto.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].clientX;
    if (touchEndX - touchStartX > 50) {
      hiddenContent.style.display = 'none';
      konamiText.style.display = 'block';
    } else if (touchStartX - touchEndX > 50) {
      hiddenContent.style.display = 'block';
      konamiText.style.display = 'none';
    }
  });
</script>

<style>
  #my-photo {
    display: block;
    margin: auto;
  }

  #my-photo:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease-in-out;
  }
</style>
