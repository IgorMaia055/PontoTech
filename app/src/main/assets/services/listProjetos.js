   setTimeout(() => {
       getProjetos().then(data => {
           let projetos = JSON.parse(data)

           for (const projeto of projetos[0].values) {
               getClientes().then(dataCliente => {
                   let clientes = JSON.parse(dataCliente)

                   if (clientes.length > 0) {
                       for (const cliente of clientes[0].values) {
                           if (cliente[1] == projeto[6]) {
                               document.getElementById('projectOpts').innerHTML += ` <li class="border">
                                        <div class="dropdown-item d-flex align-items-center gap-2 py-2 projectOptOne"
                                            id="projetoSelectOne${projeto[1]}">
                                            <span class="d-inline-block bg-success rounded-circle p-1"></span>
                                            ${cliente[2]} - ${cliente[3]}
                                            <br>
                                            ${projeto[4]}
                                            <br>
                                            ${projeto[3]}
                                        </div>
                                        </li>`

                               setTimeout(() => {
                                   if (document.getElementById('projetoSelectOne' + projeto[1])) {
                                       document.getElementById('projetoSelectOne' + projeto[1]).addEventListener('click', () => {
                                           document.getElementById('id_projeto').value = projeto[1]
                                           let projectOpt = document.querySelectorAll('.projectOptOne')
                                           for (let i = 0; i < projectOpt.length; i++) {
                                               projectOpt[i].style.border = ''
                                           }
                                           document.getElementById('projetoSelectOne' + projeto[1]).style.border = '1px solid red'

                                           document.getElementById('btnCriar').disabled = false
                                       })
                                   }

                               }, 600);
                           }
                       }
                   } else {
                       console.log('NENHUM CLIENTE ENCONTRADO!')
                   }
               }).catch(erro => {
                   console.error(erro);
               })
           }
       }).catch(erro => {
           console.error(erro);
       })
   }, 1000);