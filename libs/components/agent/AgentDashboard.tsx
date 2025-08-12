import React from 'react';

export const AgentDashboard: React.FC = () => {
	return (
		<div className="agent-dashboard">
			{/* 헤더 */}
			<div className="dashboard-header">
				<div className="header-content">
					<h1>에이전트 대시보드</h1>
					<div className="header-actions">
						{/* 웹 채팅 시스템으로 대체됨 */}
					</div>
				</div>
			</div>

			{/* 메인 콘텐츠 */}
			<div className="dashboard-content">
				<div className="chat-management">
					<h2>웹 채팅 관리</h2>
					<p>웹 채팅 시스템을 통해 고객과 실시간으로 소통하세요.</p>
					<div className="chat-stats">
						<div className="stat-item">
							<div className="stat-number">0</div>
							<div className="stat-label">활성 채팅</div>
						</div>
						<div className="stat-item">
							<div className="stat-number">0</div>
							<div className="stat-label">대기 중</div>
						</div>
						<div className="stat-item">
							<div className="stat-number">0</div>
							<div className="stat-label">완료</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
