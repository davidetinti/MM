<template>
  <div id="app">
    <div style="height: 100vh; width: 100vw" class="d-flex flex-column">
      <div class="topbar d-flex align-items-center justify-content-center">
        <h2>{{ selected_section.title }}</h2>
      </div>
      <div class="d-flex page-content">
        <div class="scrollable mx-2">
          <b-table
            responsive
            borderless
            v-if="selected_section == sections[0]"
            :items="game.players"
            :fields="home_fields"
            tbody-tr-class="table-row"
            thead-class="cell-default"
          >
            <template v-slot:cell(actions)="data">
              <b-button
                class="status-button"
                @click="showInfo(data.item)"
                :class="infoButtonClass(data.item)"
              >
                <b-icon-info-circle></b-icon-info-circle>
              </b-button>
              <b-button
                class="status-button"
                @click="openChat(data.item)"
                :class="chatButtonClass(data.item)"
              >
                <b-icon-chat></b-icon-chat>
              </b-button>
              <b-button
                class="status-button"
                @click="showPhotoModal(data.item)"
                :class="photoButtonClass(data.item)"
              >
                <b-icon-camera></b-icon-camera>
              </b-button>
            </template>
          </b-table>

          <b-table
            responsive
            borderless
            v-if="selected_section == sections[1]"
            :items="ordinate_player"
            :fields="ranking_fields"
            tbody-tr-class="table-row"
            thead-class="cell-default"
          >
            <template v-slot:cell(percentage)="data">
              {{ playerPercentage(data) }}
              %
            </template>
          </b-table>

          <b-container
            v-if="selected_section == sections[2]"
            style="height: 100%; width: 100vw"
          >
            <div
              style="height: 90%; width: 100%"
              class="esp d-flex align-items-center justify-content-center"
            >
              <b-button
                class="esporta ml-2 mr-2"
                style="height: 25vh; width: 70%"
                @click="exportData"
              >
                <h3>Scarica file JSon</h3>
              </b-button>
            </div>
            <div style="height: 10%" class="d-flex justify-content-center">
              <h3>Chiave d'accesso alla partita: {{ game_key }}</h3>
            </div>
          </b-container>

          <!-- Info Modal -->
          <b-modal
            id="info-modal"
            size="lg"
            @ok="updatePlayer()"
            @show="setInfoModal"
          >
            <template #modal-header>
              <h4 class="m-0" v-if="selected_player">
                {{ selected_player.name }}
              </h4>
            </template>
            <template #default>
              <div v-if="selected_player" style="height: 60vh">
                <div
                  class="d-flex flex-column"
                  style="width: 100%; height: 100%; overflow-y: auto"
                >
                  <h4 class="mt-4 ml-4">Modifica il nome del giocatore</h4>
                  <b-form-input
                    max-lenght="50"
                    style="width: 50%"
                    class="ml-4 mt-4"
                    type="text"
                    v-model="name_to_edit"
                    placeholder="Inserisci il nome..."
                  ></b-form-input>
                  <h4 class="mt-4 ml-4">Stato del giocatore</h4>
                  <h5 class="mt-4 ml-4">Missione corrente</h5>
                  <h5 class="mt-4 ml-4">
                    {{ selected_player.status.mission.title }}
                  </h5>
                  <h5 class="mt-4 ml-4">Attività corrente</h5>
                  <h5 class="mt-4 ml-4">
                    {{ selected_player.status.activity.title }}
                  </h5>
                  <h5 class="mt-4 ml-4">
                    Tempo trascorso nell'attività corrente
                  </h5>
                  <h5 class="mt-4 ml-4">
                    {{ selected_player.status.time_stuck }} secondi
                  </h5>
                  <h5 class="mt-4 ml-4">
                    Tempo trascorso dall'avvio della partita
                  </h5>
                  <h5 class="mt-4 ml-4">{{ selected_player.time }} secondi</h5>
                  <h5 class="mt-4 ml-4">Percentuale di risposte corrette</h5>
                  <h5 class="mt-4 ml-4">
                    {{
                      selected_player.total_activities
                        ? (
                            (selected_player.total_points /
                              selected_player.total_activities) *
                            100
                          ).toFixed(2)
                        : "0"
                    }}
                    %
                  </h5>
                </div>
              </div>
            </template>
            <template #modal-footer="{ hide, ok }">
              <div class="d-flex justify-content-end">
                <b-button class="m-1" @click="hide()"> Indietro </b-button>
                <b-button class="m-1" @click="ok()"> Salva </b-button>
              </div>
            </template>
          </b-modal>

          <!-- Chat Modal -->
          <b-modal
            id="chat-modal"
            size="lg"
            @show="is_chat_open = true"
            @close="is_chat_open = false"
          >
            <template #modal-header>
              <h4 class="m-0" v-if="selected_player">
                Chat con {{ selected_player.name }}
              </h4>
            </template>
            <template #default>
              <div v-if="selected_player" style="height: 60vh">
                <div
                  class="d-flex flex-column"
                  style="width: 100%; height: 100%; overflow-y: auto"
                >
                  <div
                    v-for="(message, index) in messages[selected_player.id]"
                    :key="index"
                    :class="message.sender ? 'player-message' : 'tutor-message'"
                    class="m-2 p-2 message"
                  >
                    {{ message.text }}
                  </div>
                </div>
              </div>
            </template>
            <template #modal-footer>
              <div class="d-flex" style="width: 100%">
                <b-button @click="sendMessage()" class="m-1">Invia</b-button>
                <b-form-input class="m-1" v-model="message"></b-form-input>
              </div>
            </template>
          </b-modal>

          <!-- Photo modal -->
          <b-modal
            id="photo-modal"
            size="lg"
            hide-footer
            :title="selected_player ? 'Foto da ' + selected_player.name : ''"
          >
            <div v-if="selected_player_id">
              <div
                v-if="photos[selected_player_id].question"
                class="d-flex flex-column align-items-center"
              >
                <div class="mt-4 mb-2">
                  Il giocatore ha risposta alla domanda
                </div>
                <h6 class="m-2">
                  " {{ photos[selected_player_id].question }} "
                </h6>
                <div class="m-2">con la seguente foto</div>
                <img
                  :src="photos[selected_player_id].answer"
                  width="70%"
                  height="auto"
                  class="m-2"
                  alt="Foto inviata dall'utente"
                />
                <div class="m-2">La foto risulta corretta o sbagliata?</div>
                <div
                  class="d-flex justify-content-center mt-2 mb-4"
                  style="width: 100%"
                >
                  <b-button
                    class="mx-2 py-3"
                    style="width: 35%"
                    @click="photoResponse(false)"
                  >
                    Rifiuta
                  </b-button>
                  <b-button
                    class="mx-2 py-3"
                    style="width: 35%"
                    @click="photoResponse(true)"
                  >
                    Accetta
                  </b-button>
                </div>
              </div>
              <div v-else class="my-5 d-flex flex-column align-items-center">
                Nessuna foto in attesa di valutazione
              </div>
            </div>
          </b-modal>
        </div>
      </div>
      <div class="d-flex py-1 px-1 topbar">
        <b-button class="flex-fill m-1" @click="selected_section = sections[0]">
          <b-icon icon="person-fill"></b-icon>
        </b-button>
        <b-button class="flex-fill m-1" @click="selected_section = sections[1]">
          <b-icon icon="bar-chart-fill"></b-icon>
        </b-button>
        <b-button class="flex-fill m-1" @click="selected_section = sections[2]">
          <b-icon icon="gear-fill"></b-icon>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  data() {
    return {
      wsc: null,
      game: {
        players: [],
      },
      game_key: "",
      story_key: "",
      selected_player_id: "",
      message: "",
      name_to_edit: "",
      messages: {},
      last_viewed_message: {},
      is_chat_open: false,
      photos: {},
      sections: [
        {
          title: "GIOCATORI",
        },
        {
          title: "CLASSIFICA",
        },
        {
          title: "IMPOSTAZIONI",
        },
      ],
      home_fields: [
        {
          key: "name",
          label: "Giocatore",
          thStyle: "width: 100%",
        },
        {
          key: "actions",
          label: "Azioni",
          thStyle: "width: min-content",
        },
      ],
      ranking_fields: [
        {
          key: "name",
          label: "Nome",
          thStyle: "width: 100%",
        },
        {
          key: "time",
          label: "Tempo",
          thStyle: "width: min-content",
        },
        {
          key: "percentage",
          label: "Percentuale",
          thStyle: "width: min-content",
        },
      ],
      selected_section: null,
    };
  },
  computed: {
    selected_player: function () {
      if (this.selected_player_id) {
        for (let i = 0; i < this.game.players.length; i++) {
          if (this.game.players[i].id == this.selected_player_id)
            return this.game.players[i];
        }
      } else {
        return null;
      }
      return null;
    },
    ordinate_player: function () {
      let a = JSON.parse(JSON.stringify(this.game.players));

      for (let i = 0; i < a.length; i++) {
        var swapped = false;
        for (let j = 1; j < a.length - i; j++) {
          if (a[j - 1].total_activities != 0 && a[j].total_activities != 0) {
            if (
              a[j - 1].total_points / a[j - 1].total_activities ==
              a[j].total_points / a[j].total_activities
            ) {
              if (a[j - 1].time > a[j].time) {
                let temp = a[j - 1];
                a[j - 1] = a[j];
                a[j] = temp;
                swapped = true;
              }
            }
            if (
              a[j - 1].total_points / a[j - 1].total_activities <
              a[j].total_points / a[j].total_activities
            ) {
              let temp = a[j - 1];
              a[j - 1] = a[j];
              a[j] = temp;
              swapped = true;
            }
          } else {
            if (a[j - 1].total_activities == 0 && a[j].total_activities != 0) {
              let temp = a[j - 1];
              a[j - 1] = a[j];
              a[j] = temp;
              swapped = true;
            }
            if (a[j - 1].total_activities == 0 && a[j].total_activities == 0) {
              if (a[j - 1].time > a[j].time) {
                let temp = a[j - 1];
                a[j - 1] = a[j];
                a[j] = temp;
                swapped = true;
              }
            }
          }
        }
        if (!swapped) break;
      }
      return a;
    },
  },
  methods: {
    playerPercentage(data) {
      let player = data.item;
      if (player.total_activities) {
        let percentage = (player.total_points / player.total_activities) * 100;
        return percentage.toFixed(2);
      } else return 0;
    },
    initTutor() {
      fetch("/api/tutor?game_key=" + this.game_key)
        .then((response) => response.json())
        .then((data) => {
          this.game = data;
          this.game.players.forEach((player) => {
            if (this.messages[player.id] == undefined)
              this.messages[player.id] = [];
            if (this.photos[player.id] == undefined)
              this.photos[player.id] = {};
            if (this.last_viewed_message[player.id] == undefined)
              this.last_viewed_message[player.id] = 0;
          });
          setInterval(this.updateTutor, 2000);
        });
    },
    initWebSocket() {
      let that = this;
      this.wsc = new WebSocketClient();

      this.wsc.open("wss://site181982.tw.cs.unibo.it");

      this.wsc.onmessage = function (data) {
        let message = JSON.parse(data.data);
        if (
          message.story_key == that.story_key &&
          message.game_key == that.game_key &&
          message.sender == false
        ) {
          switch (message.type) {
            case "msg":
              that.messages[message.player_id].push({
                text: message.message,
                sender: false,
              });
              if (
                that.is_chat_open &&
                that.selected_player_id == message.player_id
              )
                that.last_viewed_message[message.player_id] =
                  that.messages[message.player_id].length;
              break;
            case "photo":
              that.photos[message.player_id].answer = message.answer;
              that.photos[message.player_id].question = message.question;
              break;
            default:
              break;
          }
        }
      };
    },
    updateTutor() {
      fetch("/api/tutor/update?game_key=" + this.game_key)
        .then((response) => response.json())
        .then((data) => {
          this.game = data;
          this.game.players.forEach((player) => {
            if (this.messages[player.id] == undefined)
              this.messages[player.id] = [];
            if (this.photos[player.id] == undefined)
              this.photos[player.id] = {};
            if (this.last_viewed_message[player.id] == undefined)
              this.last_viewed_message[player.id] = 0;
          });
        });
    },
    updatePlayer() {
      fetch(
        "/api/tutor/update?player_id=" +
          this.selected_player_id +
          "&game_key=" +
          this.game_key +
          "&story_key=" +
          this.story_key,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.name_to_edit,
          }),
        }
      ).then((response) => {
        if (response.ok) this.selected_player.name = this.name_to_edit;
      });
    },
    setInfoModal() {
      this.name_to_edit = JSON.parse(JSON.stringify(this.selected_player.name));
    },
    openChat(player) {
      this.selected_player_id = player.id;
      this.$bvModal.show("chat-modal");
      this.last_viewed_message[player.id] = this.messages[player.id].length;
    },
    showInfo(player) {
      this.selected_player_id = player.id;
      this.$bvModal.show("info-modal");
    },
    sendMessage() {
      if (this.message) {
        this.wsc.send(
          JSON.stringify({
            type: "msg",
            message: this.message,
            player_id: this.selected_player.id,
            game_key: this.game_key,
            story_key: this.story_key,
            sender: true,
          })
        );
        this.messages[this.selected_player.id].push({
          text: this.message,
          sender: true,
        });
        this.last_viewed_message[this.selected_player.id] = this.messages[
          this.selected_player.id
        ].length;
        this.message = "";
      }
    },
    infoButtonClass(player) {
      return {
        blue: player.status.activity
          ? player.status.time_stuck > player.status.activity.max_time
          : false,
      };
    },
    photoButtonClass(player) {
      return {
        orange: this.photos[player.id].question,
      };
    },
    chatButtonClass(player) {
      return {
        red:
          this.last_viewed_message[player.id] < this.messages[player.id].length,
      };
    },
    showPhotoModal(player) {
      this.selected_player_id = player.id;
      this.$bvModal.show("photo-modal");
    },
    photoResponse(answer) {
      this.wsc.send(
        JSON.stringify({
          type: "photo",
          answer: answer,
          player_id: this.selected_player.id,
          game_key: this.game_key,
          story_key: this.story_key,
          sender: true,
        })
      );
      this.photos[this.selected_player_id] = {};
    },
    exportData() {
      let data = JSON.stringify(this.game);
      let blob = new Blob([data], {
        type: "application/json",
      });
      let filename = "Dati di gioco";
      let link = document.createElement("a");
      link.download = filename;
      //Funzione createObjectURL cross-browser
      let createObjectURL =
        (window.URL || window.webkitURL || {}).createObjectURL ||
        function () {};
      link.href = createObjectURL(blob);
      link.click();
    },
  },
  created: function () {
    let urlParams = new URLSearchParams(window.location.search);
    this.game_key = urlParams.get("game_key");
    this.story_key = urlParams.get("story_key");
    this.selected_section = this.sections[0];
    this.initTutor();
    this.initWebSocket();
  },
};

// Implementazione presa da https://github.com/websockets/ws/wiki/Websocket-client-implementation-for-auto-reconnect

function WebSocketClient() {
  this.autoReconnectInterval = 1000; // ms
}
WebSocketClient.prototype.open = function (url) {
  this.url = url;
  this.instance = new WebSocket(this.url);
  this.instance.onopen = () => {
    this.onopen();
  };
  this.instance.onmessage = (data, flags) => {
    this.number++;
    this.onmessage(data, flags, this.number);
  };
  this.instance.onclose = (e) => {
    if (e.code == 1000) console.log("WebSocket: closed");
    // CLOSE_NORMAL
    else this.reconnect(e); // Abnormal closure
    this.onclose(e);
  };
  this.instance.onerror = (e) => {
    if (e.code == "ECONNREFUSED") this.reconnect(e);
    else this.onerror(e);
  };
};

WebSocketClient.prototype.send = function (data, option) {
  try {
    this.instance.send(data, option);
  } catch (e) {
    this.instance.emit("error", e);
  }
};

WebSocketClient.prototype.reconnect = function (e) {
  console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`, e);
  var that = this;
  setTimeout(function () {
    console.log("WebSocketClient: reconnecting...");
    that.open(that.url);
  }, this.autoReconnectInterval);
};

WebSocketClient.prototype.onopen = function (e) {
  console.log("WebSocketClient: open", arguments);
};
WebSocketClient.prototype.onmessage = function (data, flags, number) {
  console.log("WebSocketClient: message", arguments);
};
WebSocketClient.prototype.onerror = function (e) {
  console.log("WebSocketClient: error", arguments);
};
WebSocketClient.prototype.onclose = function (e) {
  console.log("WebSocketClient: closed", arguments);
};
</script>

<style>
body {
  color: var(--text-color);
  background-color: var(--primary-color);
}

.topbar {
  height: 4rem;
  background-color: var(--secondary-color);
}

.page-content {
  height: calc(100vh - 4rem - 4rem);
}

.scrollable {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.btn {
  background-color: var(--form-color);
  color: var(--text-color);
  margin: 0;
  border: none;
  outline: none;
}

.btn:focus {
  background-color: var(--hover-color);
  outline: none;
  border: none;
}

.player-row {
  background-color: var(--object-color);
  border: 0px;
  border-radius: 4px;
  color: var(--text-color);
  white-space: nowrap;
  text-align: left;
  margin-top: 15px;
}

.form-control {
  background-color: var(--form-color);
  color: var(--text-color);
  border: none;
  border-radius: 10px;
}

.form-control:focus {
  background-color: var(--form-color);
  color: var(--text-color);
  border: none;
  box-shadow: none;
}

.modal-header {
  background-color: var(--secondary-color);
  border: none;
}

.modal-footer {
  padding: 0;
  border: none;
  height: 68px;
  background-color: var(--secondary-color);
}

.modal-body {
  background-color: var(--primary-color);
  color: var(--text-color);
}

.modal-body {
  padding: 0px;
}

.orange {
  background-color: orange !important;
}

.orange:focus {
  background-color: orange !important;
}

.red {
  background-color: red !important;
}

.red:hover {
  background-color: red !important;
}

.blue {
  background-color: blue !important;
}

.blue:hover {
  background-color: blue !important;
}

.player-message {
  background-color: var(--secondary-color);
  text-align: end;
  margin-left: 60px !important;
}

.tutor-message {
  background-color: var(--form-color);
  text-align: left;
  margin-right: 60px !important;
}

.message {
  border-radius: 5px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  box-shadow: 3px 3px 8px black;
}

.esp .esporta {
  background-color: #1a1c2c;
  color: #ffffff;
  margin: 0;
  outline: none;
  border: 5px solid;
  border-color: #00ca5b;
}

.status-button:focus {
  background-color: unset;
}

.b-table {
  border-collapse: separate;
  border-spacing: 0px 15px;
}

.table-row {
  background-color: var(--object-color);
  color: var(--text-color);
}

.cell-default {
  color: var(--text-color);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.table td,
.table th {
  vertical-align: middle;
  white-space: nowrap;
}
</style>
