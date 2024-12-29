import { store } from "../main.js";
import { embed, getFontColour } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchSupporters, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "owner",
    coowner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
    patreon: "patreon",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 999" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <div class="packs" v-if="level.packs.length > 0">
                        <div v-for="pack in level.packs" class="tag" :style="{background:pack.colour}">
                            <p>{{pack.name}}</p>
                        </div>
                    </div>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify, list.length) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Diff</div>
                            <p>{{ level.diff || 'Demon' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 150"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else>100% or better to qualify</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Original List by <a href="https://tsl.pages.dev/#/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3 align="center">Editores de Lista</h3>
                        <ol class="editors">
                            <ol class="rank" v-for="rank in editors">
                                <li v-for="member in rank.members">
                                    <img :src="\`/assets/\${roleIconMap[rank.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="rank.role">
                                    <a v-if="member.link" class="type-label-lg link" target="_blank" :href="member.link">{{ member.name }}</a>
                                    <p v-else>{{ member.name }}</p>
                                </li>
                            </ol>
                        </ol>
                        <h3 align="center">Apoyo</h3>
                        <ol class="editors">
                            <ol class="rank" v-for="rank in supporters">
                                <li v-for="member in rank.members">
                                    <img :src="\`/assets/\${roleIconMap[rank.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="rank.role">
                                    <a v-if="member.link" class="type-label-lg link" target="_blank" :href="member.link">{{ member.name }}</a>
                                    <p v-else>{{ member.name }}</p>
                                </li>
                            </ol>
                        </ol>
                    </template>
                     <h3>> Como subir records</h3>
                    <p>
                        Unete al discord y envialo por un canal especifico :D
                    </p>
                    <h3>> Reglas Generales</h3>
                    <p>
                        - No está permitido hackear niveles ni utilizar noclip. Cualquier evidencia de trampas resultará en la descalificación inmediata.
                    </p>
                    <p>
                        - Límite máximo de FPS Bypass: 240 FPS.
                        - No se acepta: TPS/Physic Bypass y Click Bewteen Frames
                    </p>

                    <h3>> Envío de Récords (Insane/Extreme Demon)</h3>
                    <p>
                        - Sin grabación, no cuenta: Los récords enviados sin video no serán considerados.
                    </p>
                    <p>
                        - Niveles modificados: No se aceptarán niveles completados con modificaciones.
                    </p>
                    <p>
                        - Videos con cortes: Los envíos con videos editados o con cortes tampoco serán válidos.
                    </p>
                    <h3>> Requisitos para los Videos de Récord</h3>
                    <p>
                        - Raw Footage: El video debe incluir la grabación completa sin editar.
                    </p>
                    <p>
                        - Cheat Indicators: El video debe mostrar herramientas como el Contador de CPS y Cheat Indicator.
                    </p>
                    <p>
                        - Plataformas aceptadas:
                        <ul>
                            <li>YouTube (recomendado).</li>
                            <li>Google Drive.</li>
                            <li>No se aceptan enlaces de MediaFire ni Mega.</li>
                        </ul>
                    </p>
                    
                    <h3>> ¿Por qué fue rechazado mi récord?</h3>
                    <p>
                        Si tu récord fue rechazado, el staff te explicara.
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        supporters: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
    },
    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();
        this.supporters = await fetchSupporters();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
            if (!this.supporters) {
                this.errors.push("Failed to load supporters.");
            }
        }

        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        embed,
        score,
        getFontColour,
    },
};
