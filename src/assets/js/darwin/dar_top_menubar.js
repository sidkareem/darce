

function get_top_menubar_html(sidebar_id){
	return `

	<div class="navbar navbar-inverse navbar-fixed-top">
		<div class="navbar-header">
		<a class="navbar-brand" href="index.html"><img src="data:image/png;base64,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
		AASUVORK5CYII=" alt=""></a>
  

			<ul class="nav navbar-nav visible-xs-block">
				<li><a data-toggle="collapse" data-target="#navbar-mobile"><i class="icon-tree5"></i></a></li>
				<li><a class="sidebar-mobile-main-toggle"><i class="icon-paragraph-justify3"></i></a></li>
			</ul>
		</div>

		<div class="navbar-collapse collapse" id="navbar-mobile">
		
			<!-- NAVBAR ITEMS -->
			<ul id='navbar-items' class="nav navbar-nav">
				<li><a class="sidebar-control sidebar-main-toggle hidden-xs"><i class="icon-paragraph-justify3"></i></a></li>  

			</ul>

			<div class="navbar-right">
				<ul class="nav navbar-nav">

					<li class="dropdown dropdown-user">
						<a class="dropdown-toggle" data-toggle="dropdown">
							<i class="icon-help position-left"></i><span>HELP</span>
						</a>
						
						<ul class="dropdown-menu">	
							<li><a href="#" class="help-about-evo-btn"> About Darwin EVO Website</a></li>						
							<li><a target="_blank" href="https://darwinepm.zendesk.com/hc/en-us/sections/360003957672-DarCE-Space-Overview"> DarCE EVO Help Guide</a></li>						
						</ul>
					</li>

					<li class="dropdown connect-environment dropdown-user">
						<a class="dropdown-toggle" data-toggle="dropdown">
							<i class="icon-enter2"></i>
							<span>...</span>
							<i class="caret"></i>
						</a>
						
						<ul class="dropdown-menu dropdown-menu-right">							
						</ul>
					</li>				

					<li class="dropdown dropdown-user">
						<a class="dropdown-toggle" id="user_display_name" data-toggle="dropdown">
							<i class="icon-user"></i>
							<span>...</span>
							<i class="caret"></i>
						</a>

						<ul class="dropdown-menu dropdown-menu-right">
							<li><a href="#" class="user-logout-btn"><i class="icon-switch2"></i> Logout</a></li>
							<li class="divider"></li>
							<li><a href="#" class="refresh-cache-btn" onclick="deleteIndexedDB()"><i class="icon-sync"></i> Clear & Refresh Cache</a></li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>

	`;
}
