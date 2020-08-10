#!/bin/sh

[[ -z "$URL" ]] && \
  echo "Please set Jackett URL." && exit 1

[[ -z "$APIKEY" ]] && \
  echo "Please set Jackett api key." && exit 1

URL="--url $URL"
APIKEY="--apikey $APIKEY"

[[ ! -z "$ALTURL" ]] && \
  ALTURL="--alturl $ALTURL"

[[ ! -z "$SONARR_URL" ]] && \
  SONARR_URL="--sonarrurl $SONARR_URL"

[[ ! -z "$SONARR_KEY" ]] && \
  SONARR_KEY="--sonarrkey $SONARR_KEY"

[[ ! -z "$SONARR_CATS" ]] && \
  SONARR_CATS="--sonarrcats $SONARR_CATS"

[[ ! -z "$RADARR_URL" ]] && \
  RADARR_URL="--radarrurl $RADARR_URL"

[[ ! -z "$RADARR_KEY" ]] && \
  RADARR_KEY="--radarrkey $RADARR_KEY"

[[ ! -z "$RADARR_CATS" ]] && \
  RADARR_CATS="--radarrcats $RADARR_CATS"

[[ ! -z "$LIDARR_URL" ]] && \
  LIDARR_URL="--lidarrurl $LIDARR_URL"

[[ ! -z "$LIDARR_KEY" ]] && \
  LIDARR_KEY="--lidarrkey $LIDARR_KEY"

[[ ! -z "$LIDARR_CATS" ]] && \
  LIDARR_CATS="--lidarrcats $LIDARR_CATS"

cd /jackett-sync

yarn start $URL $APIKEY $ALTURL \
	$SONARR_URL $SONARR_KEY $SONARR_CATS \
	$RADARR_URL $RADARR_KEY $RADARR_CATS \
	$LIDARR_URL $LIDARR_KEY $LIDARR_CATS $*