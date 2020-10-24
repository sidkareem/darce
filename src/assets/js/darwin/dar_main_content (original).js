function get_content_html(sidebar_id){
	
	return `


	<script type="text/javascript" src="assets/js/darwin/dar_dashboard.js"></script>
	


	<div class="tab-content">
		<div class="tab-pane has-padding active" id="bordered-tab1">
						
			<!-- Progress counters -->
			<div class="row">
				<div class="col-md-3">

					<!-- Available hours -->
					<div class="panel text-center">
						<div class="panel-body">
							<div class="heading-elements">
								<ul class="icons-list"></ul>
							</div>

							<!-- Progress counter -->
							<div class="content-group-sm svg-center position-relative" id="rev-progress123"></div>
							<!-- /progress counter -->


							<!-- Bars -->
							<div id="rev-bars"></div>
							<!-- /bars -->
			
						</div>
					</div>
					<!-- /available hours -->

				</div>
				
				<div class="col-md-3">

					<!-- Available hours -->
					<div class="panel text-center">
						<div class="panel-body">
							<div class="heading-elements">
								<ul class="icons-list">
							     	<li class="dropdown text-muted"><a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-cog3"></i> <span class="caret"></span></a>
										<ul class="dropdown-menu dropdown-menu-right">
											<li><a href="#"><i class="icon-sync"></i> Change Comparison</a></li>
											<li><a href="#"><i class="icon-list-unordered"></i> Switch KPI</a></li>
											<li><a href="#"><i class="icon-pie5"></i> Make Permanent </a></li>
											<li><a href="#"><i class="icon-cross3"></i> Remove Chart</a></li>
										</ul>
							          </li>
							     </ul>
						     </div>

						     <!-- Progress counter -->
							<div class="content-group-sm svg-center position-relative" id="gm-progress"></div>
							<!-- /progress counter -->


							<!-- Bars -->
							<div id="gm-bars"></div>
							<!-- /bars -->
			
						</div>
					</div>
					<!-- /available hours -->

				</div>
								
				<div class="col-md-3">

					<!-- Available hours -->
					<div class="panel text-center">
						<div class="panel-body">
							<div class="heading-elements">
								<ul class="icons-list">
							          <li class="dropdown text-muted"><a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-cog3"></i> <span class="caret"></span></a>
										<ul class="dropdown-menu dropdown-menu-right">
											<li><a href="#"><i class="icon-sync"></i> Change Comparison</a></li>
											<li><a href="#"><i class="icon-list-unordered"></i> Switch KPI</a></li>
											<li><a href="#"><i class="icon-pie5"></i> Make Permanent </a></li>
											<li><a href="#"><i class="icon-cross3"></i> Remove Chart</a></li>
										</ul>
							          </li>
							     </ul>
						     </div>

						     <!-- Progress counter -->
							<div class="content-group-sm svg-center position-relative" id="opex-progress"></div>
							<!-- /progress counter -->


							<!-- Bars -->
							<div id="opex-bars"></div>
							<!-- /bars -->
			
						</div>
					</div>
					<!-- /available hours -->

				</div>
								
				<div class="col-md-3">

					<!-- Available hours -->
					<div class="panel text-center">
						<div class="panel-body">
							<div class="heading-elements">
								<ul class="icons-list">
							     	<li class="dropdown text-muted"><a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-cog3"></i> <span class="caret"></span></a>
										<ul class="dropdown-menu dropdown-menu-right">
											<li><a href="#"><i class="icon-sync"></i> Change Comparison</a></li>
											<li><a href="#"><i class="icon-list-unordered"></i> Switch KPI</a></li>
											<li><a href="#"><i class="icon-pie5"></i> Make Permanent </a></li>
											<li><a href="#"><i class="icon-cross3"></i> Remove Chart</a></li>
										</ul>
							          </li>
							     </ul>
						     </div>

							<!-- Progress counter -->
							<div class="content-group-sm svg-center position-relative" id="ni-progress"></div>
							<!-- /progress counter -->


							<!-- Bars -->
							<div id="ni-bars"></div>
							<!-- /bars -->
			
						</div>
					</div>
					<!-- /available hours -->

				</div>						
			</div>
		</div>

		<div class="tab-pane has-padding" id="bordered-tab2">
			Frank Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid laeggin.
		</div>

		<div class="tab-pane has-padding" id="bordered-tab3">
			TEST
		</div>
	</div>
	`;
}