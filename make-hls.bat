@echo off
:: ============================================
:: Make HLS multi-quality streams from 1 MP4
:: Usage: make-hls.bat input.mp4
:: Output: public\hls\master.m3u8
:: ============================================

if "%~1"=="" (
  echo ❌ Please provide an input file. Example: make-hls.bat video.mp4
  exit /b
)

set INPUT=%~1
set OUTPUT=public\hls

:: Create output folder
if not exist %OUTPUT% mkdir %OUTPUT%

echo 🎬 Processing %INPUT% ...

ffmpeg -i "%INPUT%" ^
  -filter:v:0 scale=w=426:h=240 -c:a aac -ar 48000 -b:a 96k -c:v h264 -b:v 400k -profile:v baseline -level 3.0 -hls_time 6 -hls_playlist_type vod %OUTPUT%\240p.m3u8 ^
  -filter:v:1 scale=w=854:h=480 -c:a aac -ar 48000 -b:a 128k -c:v h264 -b:v 800k -profile:v main -level 3.1 -hls_time 6 -hls_playlist_type vod %OUTPUT%\480p.m3u8 ^
  -filter:v:2 scale=w=1280:h=720 -c:a aac -ar 48000 -b:a 128k -c:v h264 -b:v 2800k -profile:v high -level 4.0 -hls_time 6 -hls_playlist_type vod %OUTPUT%\720p.m3u8 ^
  -filter:v:3 scale=w=1920:h=1080 -c:a aac -ar 48000 -b:a 192k -c:v h264 -b:v 5000k -profile:v high -level 4.2 -hls_time 6 -hls_playlist_type vod %OUTPUT%\1080p.m3u8

:: Create master playlist
echo #EXTM3U > %OUTPUT%\master.m3u8
echo #EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x240 >> %OUTPUT%\master.m3u8
echo 240p.m3u8 >> %OUTPUT%\master.m3u8
echo #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480 >> %OUTPUT%\master.m3u8
echo 480p.m3u8 >> %OUTPUT%\master.m3u8
echo #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720 >> %OUTPUT%\master.m3u8
echo 720p.m3u8 >> %OUTPUT%\master.m3u8
echo #EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080 >> %OUTPUT%\master.m3u8
echo 1080p.m3u8 >> %OUTPUT%\master.m3u8

echo ✅ Done! Files are in %OUTPUT%
echo 👉 Use /hls/master.m3u8 in your React player
pause
