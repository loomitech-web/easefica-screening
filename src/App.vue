<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" class="primary darken-1" style="opacity:0.9" width=200 app mini-variant
      expand-on-hover permanent v-if="$authLock.isAuthorised()">

      <div style="height:64px; width:200px;padding:0px 16px">
        <v-row>
          <v-col>
            <v-img style="margin-left:56px;opacity:0.5" contain src="./assets/logo-white.png" width="120" />
          </v-col>
        </v-row>
      </div>

      <v-list dense shaped dark>
        <v-list-item-group v-model="item" color="accent" active-class="pink lighten-1" dark>
          <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" color="white">
            <v-list-item-icon>
              <v-icon color="white" v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="transparent" dark flat v-if="$authLock.isAuthorised()">
      <v-toolbar-title>
        <v-row>
          <v-col>
            <v-img class="shrink" contain src="./assets/logo-white.png" transition="scale-transition" width="120" />
          </v-col>
        </v-row>
      </v-toolbar-title>


      <v-card
        style="margin-left:48px;margin-top:-16px;border-top-left-radius:0px;border-top-right-radius:0px;opacity:0.9"
        dark elevation="10">

        <v-row class="ai-info accent" align="center">
          <v-col cols="12" align="center" justify="center">
            <v-btn elevation="0" color="accent">
              <v-icon>mdi-laptop</v-icon>
              <div class='role'>{{ user.company }}<br>{{ user.role }} </div>
            </v-btn>
          </v-col>
        </v-row>

      </v-card>


      <v-spacer></v-spacer>

      <v-card
        style="margin-right:32px;margin-top:-16px;border-top-left-radius:0px;border-top-right-radius:0px;opacity:0.9"
        dark elevation="10">

        <v-row class="ai-info primary darken-2" align="center">
          <v-col cols="8" align="center" justify="center">
            <v-btn elevation="0" color="primary darken-2">
              <v-icon>mdi-account</v-icon>
              <div class='role'>{{ user.firstName }} {{ user.lastName }}</div>
            </v-btn>
          </v-col>
          <v-col cols="2">
            <v-btn elevation="0" color="primary darken-2" @click="$authLock.logout()">
              <v-icon>mdi-logout-variant</v-icon>
            </v-btn>
          </v-col>
        </v-row>

      </v-card>

    </v-app-bar>

    <v-main>
      <router-view></router-view>
      <v-progress-circular v-if="loading" color="accent" class="progress" :indeterminate="true" />
      <router-view />
    </v-main>

    <footer style="position: sticky; bottom:0px;background:#0a7cb9aa">
      <LegalFooter />
    </footer>

  </v-app>
</template>

<script>
import LegalFooter from './components/LegalFooter';


</script>