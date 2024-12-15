import { PlaceProps } from '@/components/place'
import { router } from 'expo-router'
import React, { useRef } from 'react'
import { Text, View, Platform, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
   
import * as L from"leaflet"
type Props = {
  latitude: number;
  longitude: number;
  markets: PlaceProps[];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iframe: {
    width: '100%',
    height: '100%',
    pointerEvents: 'auto',
  },
  webView: {
    flex: 1,
    pointerEvents: 'auto',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },   
})

const MapView = ({ latitude, longitude, markets }: Props) => {
  const webviewRef = useRef<WebView>(null);
  const imagePin:any = require('@/assets/pin.png')
  const locationPin:any = require('./../assets/pin.png')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>
      <link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' />
      <script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; }
      </style>
    </head>
    <body>
      <div id="error"></div>
      <div id='map'></div>
      <script>
        try {
          var map = L.map('map').setView([${latitude}, ${longitude}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      
           // Usando o pinIcon com a URL
      
          // Current location marker
          L.marker([${latitude}, ${longitude}],
          {
            icon: L.icon({
                iconUrl: '${locationPin}', 
                iconSize: [38, 95], 
                iconAnchor: [22, 94], 
                popupAnchor: [-3, -76]
              })}
            )
            .addTo(map)
            .bindPopup('Sua Localização');

          // Usando o pinIcon com a URL
            var pinIcon = L.icon({
              iconUrl: '${imagePin}', 
              iconSize: [38, 95], 
              iconAnchor: [22, 94], 
              popupAnchor: [-3, -76]
            });

         // Market markers
        var markets = ${JSON.stringify(markets)};
        markets.forEach(function(market) {
          var marker = L.marker([market.latitude, market.longitude])
            .addTo(map)
            .bindPopup(\`
              <b>\${market.name}</b><br>
              \${market.address}<br>
             <a href="#" onclick="if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(JSON.stringify({type: 'navigate', id: \${market.id}})); } else { alert('WebView not available!'); }">Ver Detalhes</a>

            \`);
        })
          console.log('Map initialized successfully');
        } catch (error) {
          console.error('Map initialization error:', error);
          document.getElementById('error').innerText = 'Error: ' + error.message;
        }
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log("t",message)
      if (message.type === 'navigate') {
        router.push(`/market/${message.id}`);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={html}
          style={styles.iframe}
          sandbox="allow-scripts"
          title="Map View"
        />
      ) : (
        <WebView
          ref={webviewRef}
          style={styles.webView}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          onMessage={handleWebViewMessage}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("WebView error: ", nativeEvent);
          }}
          renderError={(errorName) => (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Erro ao carregar o mapa: {errorName}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};



export default MapView;
