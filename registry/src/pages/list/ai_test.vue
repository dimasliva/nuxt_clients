<template>
    <v-app>
      <!-- App Bar -->
      <v-app-bar color="deep-purple" dark app>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <span>Vasia</span>
        <v-avatar class="ml-2" color="white" size="36">
          <span class="deep-purple--text">V</span>
        </v-avatar>
      </v-app-bar>
  
      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" app>
        <v-list>
          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-view-dashboard</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Dashboard</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-account-group</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Users</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-shield-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Roles</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
  
      <!-- Main Content -->
      <v-main>
        <v-container fluid>
          <div class="d-flex align-center mb-4">
            <h1 class="text-h5 grey--text text--darken-2">Роли & права</h1>
            <v-spacer></v-spacer>
            <v-btn color="deep-purple" dark class="mr-2">
              <v-icon left>mdi-plus</v-icon>
              СОЗДАТЬ
            </v-btn>
            <v-btn icon>
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </div>
  
          <!-- Role List -->
          <v-expansion-panels>
            <v-expansion-panel v-for="(role, i) in roles" :key="i">
              <v-expansion-panel-header>
                {{ role.name }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div class="d-flex align-center mb-4">
                  <div class="text-h6">Роль: {{ role.name }}</div>
                  <v-spacer></v-spacer>
                  <v-btn color="deep-purple" outlined class="mr-2">
                    <v-icon left>mdi-content-save</v-icon>
                    СОХРАНИТЬ
                  </v-btn>
                  <v-btn outlined>
                    <v-icon left>mdi-close</v-icon>
                    ОТМЕНИТЬ
                  </v-btn>
                </div>
  
                <!-- Permissions Table -->
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">Права</th>
                        <th class="text-center">C</th>
                        <th class="text-center">R</th>
                        <th class="text-center">U</th>
                        <th class="text-center">D</th>
                        <th class="text-center">S</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(permission, j) in permissions" :key="j">
                        <td>{{ permission.name }}</td>
                        <td class="text-center">
                          <v-checkbox 
                            v-model="permission.permissions.create" 
                            hide-details 
                            dense
                          ></v-checkbox>
                        </td>
                        <td class="text-center">
                          <v-checkbox 
                            v-model="permission.permissions.read" 
                            hide-details 
                            dense
                          ></v-checkbox>
                        </td>
                        <td class="text-center">
                          <v-checkbox 
                            v-model="permission.permissions.update" 
                            hide-details 
                            dense
                          ></v-checkbox>
                        </td>
                        <td class="text-center">
                          <v-checkbox 
                            v-model="permission.permissions.delete" 
                            hide-details 
                            dense
                          ></v-checkbox>
                        </td>
                        <td class="text-center">
                          <v-checkbox 
                            v-model="permission.permissions.special" 
                            hide-details 
                            dense
                          ></v-checkbox>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
  export default {
    name: 'RolesPermissions',
    data() {
      return {
        drawer: true,
        roles: [
          { name: 'уб', expanded: false },
          { name: 'ghj', expanded: false },
          { name: 'admin', expanded: false },
          { name: 'Врач', expanded: true },
        ],
        permissions: [
          { 
            name: 'Компания', 
            permissions: { 
              create: true, 
              read: true, 
              update: false, 
              delete: false, 
              special: false 
            } 
          },
          { 
            name: 'Профиль компании', 
            permissions: { 
              create: false, 
              read: false, 
              update: false, 
              delete: false, 
              special: false 
            } 
          },
          { 
            name: 'Организация компании', 
            permissions: { 
              create: false, 
              read: false, 
              update: false, 
              delete: false, 
              special: false 
            } 
          },
          { 
            name: 'Сотрудники', 
            permissions: { 
              create: false, 
              read: true, 
              update: false, 
              delete: false, 
              special: false 
            } 
          },
          { 
            name: 'Документы сотрудника', 
            permissions: { 
              create: false, 
              read: false, 
              update: false, 
              delete: false, 
              special: false 
            } 
          },
          { 
            name: 'Контакты сотрудника', 
            permissions: { 
              create: false, 
              read: false, 
              update: false, 
              delete: false, 
              special: false 
            } 
          },
          { 
            name: 'Профиля сотрудника', 
            permissions: { 
              create: false, 
              read: false, 
              update: false, 
              delete: false, 
              special: false 
            } 
          },
          { 
            name: 'Роли', 
            permissions: { 
              create: false, 
              read: false, 
              update: false, 
              delete: false, 
              special: false 
            } 
          },
          { 
            name: 'Клиенты', 
            permissions: { 
              create: false, 
              read: true, 
              update: true, 
              delete: false, 
              special: false 
            } 
          },
        ]
      }
    }
  }
  </script>
  
  <style>
  .v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    padding: 0 8px !important;
  }
  </style>